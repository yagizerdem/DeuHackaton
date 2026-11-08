// Fills the development database with fake data for every mongoose model:
// User, RefreshToken, Parcel, Plant (with a real photo), Task, AnalysisRecord.
//
//   cd apps/backend
//   npx tsx src/seeder/seeder.ts            replace the seed data with fresh data
//   npx tsx src/seeder/seeder.ts --clear    only remove the seed data
//   npx tsx src/seeder/seeder.ts --users=20 change how many users are created
//
// Seed users are marked by the @seed.local email domain, only they and the data
// they own are ever deleted. Every seed user logs in with SEED_PASSWORD.
import { randomUUID } from "node:crypto";
import path from "node:path";
import bcrypt from "bcrypt";
import { fakerTR as faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { readDevEnv } from "@/read-env.js";
import { connectDB } from "@/db.js";
import { User } from "@models/user-entity.js";
import { RefreshToken } from "@models/refresh-token-entity.js";
import { Parcel } from "@models/parcel-entity.js";
import { Plant } from "@models/plant-entity.js";
import { Task } from "@models/task-entity.js";
import { AnalysisRecord } from "@models/analysis-record-entity.js";

const SEED_DOMAIN = "@seed.local";
export const SEED_PASSWORD = "Seed12345!";
const DAY_MS = 24 * 60 * 60 * 1000;
const WIKIPEDIA_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const USER_AGENT = "DeparkSeeder/1.0 (hackathon project)";

// where the farms are: around Izmir
const REGION = { lat: 38.42, lng: 27.14, spreadDeg: 0.15 };

// photoPage is the English Wikipedia article whose lead image becomes the photo
const SPECIES = [
  { name: "Domates", latin: "Solanum lycopersicum", family: "Solanaceae", photoPage: "Tomato" },
  { name: "Biber", latin: "Capsicum annuum", family: "Solanaceae", photoPage: "Bell_pepper" },
  { name: "Patlıcan", latin: "Solanum melongena", family: "Solanaceae", photoPage: "Eggplant" },
  { name: "Salatalık", latin: "Cucumis sativus", family: "Cucurbitaceae", photoPage: "Cucumber" },
  { name: "Zeytin", latin: "Olea europaea", family: "Oleaceae", photoPage: "Olive" },
  { name: "Limon", latin: "Citrus limon", family: "Rutaceae", photoPage: "Lemon" },
  { name: "İncir", latin: "Ficus carica", family: "Moraceae", photoPage: "Common_fig" },
  { name: "Üzüm", latin: "Vitis vinifera", family: "Vitaceae", photoPage: "Vitis_vinifera" },
  { name: "Buğday", latin: "Triticum aestivum", family: "Poaceae", photoPage: "Wheat" },
  { name: "Nane", latin: "Mentha spicata", family: "Lamiaceae", photoPage: "Mentha" },
  { name: "Lavanta", latin: "Lavandula angustifolia", family: "Lamiaceae", photoPage: "Lavandula" },
  { name: "Gül", latin: "Rosa damascena", family: "Rosaceae", photoPage: "Rose" },
] as const;

const PESTS = [
  { latinName: "Tuta absoluta", commonName: "Domates güvesi", type: "insect" },
  { latinName: "Bemisia tabaci", commonName: "Beyaz sinek", type: "insect" },
  { latinName: "Phytophthora infestans", commonName: "Mildiyö", type: "fungus" },
  { latinName: "Podosphaera xanthii", commonName: "Külleme", type: "fungus" },
  { latinName: "Xanthomonas campestris", commonName: "Bakteriyel yaprak lekesi", type: "bacteria" },
  { latinName: "Tomato yellow leaf curl virus", commonName: "Yaprak kıvırcıklığı virüsü", type: "virus" },
] as const;

const INVASIVE = [
  { latinName: "Halyomorpha halys", commonName: "Kahverengi kokarca" },
  { latinName: "Xylella fastidiosa", commonName: "Zeytin hızlı solgunluğu" },
  { latinName: "Ailanthus altissima", commonName: "Kokarağaç" },
] as const;

const SYMPTOMS = [
  "Yapraklarda sarı lekeler",
  "Yaprak kenarlarında kurumalar",
  "Gövdede çürüme izleri",
  "Meyvelerde siyah noktalar",
  "Yaprak altında beyaz tüylenme",
  "Solgunluk ve büzülme",
  "Yapraklarda delikler",
] as const;

const TAGS = ["sera", "açık alan", "organik", "yeni dikim", "sulama gerekli", "budanacak", "gölgede"] as const;
const TASK_TITLES = ["Sula", "İlaçla", "Buda", "Gübrele", "Kontrol et", "Toprağı havalandır", "Hasat et"] as const;
const SEVERITIES = ["none", "low", "medium", "high", "critical"] as const;
const URGENCY = {
  none: "monitor",
  low: "monitor",
  medium: "within_weeks",
  high: "within_days",
  critical: "immediate",
} as const;

type Species = (typeof SPECIES)[number];
type Severity = (typeof SEVERITIES)[number];
type Point = { lat: number; lng: number };

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

// ---- photos ----------------------------------------------------------------

type Photo = { data: Buffer; contentType: string };
const photoCache = new Map<string, Photo | null>();

// The lead image of a Wikipedia article, fetched once per species.
async function fetchPhoto(page: string): Promise<Photo | null> {
  if (photoCache.has(page)) return photoCache.get(page)!;
  let photo: Photo | null = null;
  try {
    const headers = { "User-Agent": USER_AGENT };
    const summary = await fetch(WIKIPEDIA_SUMMARY + page, { headers });
    const source = ((await summary.json()) as { thumbnail?: { source?: string } }).thumbnail?.source;
    if (source) {
      const image = await fetch(source, { headers });
      const contentType = image.headers.get("content-type") ?? "";
      if (image.ok && contentType.startsWith("image/")) {
        photo = { data: Buffer.from(await image.arrayBuffer()), contentType };
      }
    }
  } catch (error) {
    console.warn(`  photo for ${page} failed:`, (error as Error).message);
  }
  if (!photo) console.warn(`  no photo for ${page}, its plants get none`);
  photoCache.set(page, photo);
  return photo;
}

// ---- builders --------------------------------------------------------------

function userDocs(count: number, passwordHash: string) {
  return Array.from({ length: count }, (_, i) => {
    const firstName = faker.person.firstName();
    return {
      email: `${faker.helpers.slugify(firstName).toLowerCase()}.${i}${SEED_DOMAIN}`,
      passwordHash,
      userName: `${faker.helpers.slugify(firstName).toLowerCase()}_${faker.string.alphanumeric(5).toLowerCase()}`,
      gender: faker.helpers.arrayElement(["male", "female", "other"] as const),
      age: faker.number.int({ min: 18, max: 75 }),
    };
  });
}

function refreshTokenDocs(userId: unknown) {
  // one live login, sometimes an older one that was rotated away
  const live = { user: userId, jti: randomUUID(), family: randomUUID(), expiresAt: new Date(Date.now() + 7 * DAY_MS) };
  if (!faker.datatype.boolean(0.4)) return [live];
  const family = randomUUID();
  return [
    live,
    { user: userId, jti: randomUUID(), family, expiresAt: new Date(Date.now() + 3 * DAY_MS), revokedAt: faker.date.recent({ days: 2 }) },
  ];
}

function parcelDoc(owner: unknown, center: Point) {
  const width = faker.number.float({ min: 0.0008, max: 0.003 });
  const height = faker.number.float({ min: 0.0008, max: 0.003 });
  const west = center.lng;
  const south = center.lat;
  // corners as [lng, lat], the ring is not closed, the edges are slightly irregular
  const jitter = () => faker.number.float({ min: -0.0002, max: 0.0002 });
  const polygon = [
    [west + jitter(), south + jitter()],
    [west + width + jitter(), south + jitter()],
    [west + width + jitter(), south + height + jitter()],
    [west + jitter(), south + height + jitter()],
  ].map(([lng, lat]) => [round6(lng!), round6(lat!)]);
  const kind = faker.helpers.arrayElement(["field", "garden"] as const);
  return {
    owner,
    name: `${faker.location.street()} ${kind === "field" ? "Tarlası" : "Bahçesi"}`,
    kind,
    polygon,
    notes: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : undefined,
    bounds: { west, south, east: west + width, north: south + height },
  };
}

function analysisFor(species: Species, severity: Severity) {
  const sick = severity !== "none";
  const pests = sick ? faker.helpers.arrayElements(PESTS, { min: 1, max: 2 }) : [];
  const symptoms = sick ? faker.helpers.arrayElements(SYMPTOMS, { min: 1, max: 3 }) : [];
  return {
    analysis: {
      isPlant: true,
      species: {
        commonName: species.name,
        latinName: species.latin,
        family: species.family,
        confidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
      },
      symptoms,
      suspectedPestsAndDiseases: pests.map((p) => ({ ...p, reason: faker.lorem.sentence() })),
      invasiveThreats: severity === "critical" ? faker.helpers.arrayElements(INVASIVE, 1) : [],
      protectiveMeasures: sick ? [faker.lorem.sentence(), faker.lorem.sentence()] : ["Düzenli sulama ve gözlem yeterli."],
      summary: sick
        ? `${species.name} bitkisinde ${symptoms.join(", ").toLowerCase()} görüldü.`
        : `${species.name} sağlıklı görünüyor.`,
    },
    assessment: {
      severity,
      urgency: URGENCY[severity],
      spreadRisk: sick ? faker.lorem.sentence() : "Yayılma riski düşük.",
      treatmentPlan: sick
        ? [
            { step: faker.lorem.sentence(), timing: "Hemen" },
            { step: faker.lorem.sentence(), timing: "7 gün sonra tekrar" },
          ]
        : [],
      monitoring: [faker.lorem.sentence()],
      reportToAuthorities: severity === "critical",
      rationale: faker.lorem.sentences(2),
    },
  };
}

// a plant's history gets worse or recovers over time, ending in its current state
function recordDocs(owner: unknown, plantId: unknown, species: Species, tags: string[]) {
  const count = faker.number.int({ min: 0, max: 4 });
  const last = faker.number.int({ min: 0, max: SEVERITIES.length - 1 });
  const dates = faker.helpers
    .multiple(() => faker.date.recent({ days: 60 }), { count })
    .sort((a, b) => a.getTime() - b.getTime());
  return dates.map((createdAt, i) => {
    const severity = SEVERITIES[Math.max(0, Math.min(SEVERITIES.length - 1, last - (count - 1 - i)))]!;
    const mode = faker.helpers.arrayElement(["standard", "rag"] as const);
    return {
      owner,
      plantId,
      mode,
      tags,
      ...analysisFor(species, severity),
      sources:
        mode === "rag"
          ? [{ document: "EPPO Datasheet", page: faker.number.int({ min: 1, max: 40 }), excerpt: faker.lorem.sentence() }]
          : [],
      createdAt,
    };
  });
}

function taskDoc(owner: unknown, plantId: unknown, parcelId: unknown) {
  const done = faker.datatype.boolean(0.3);
  const dueDate = new Date(Date.now() + faker.number.int({ min: -10, max: 10 }) * DAY_MS);
  return {
    owner,
    title: faker.helpers.arrayElement(TASK_TITLES),
    notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : undefined,
    dueDate,
    done,
    inProgress: !done && faker.datatype.boolean(0.25),
    doneAt: done ? new Date(Math.min(Date.now(), dueDate.getTime() + DAY_MS)) : undefined,
    repeat: faker.helpers.arrayElement(["none", "none", "daily", "weekly", "monthly"] as const),
    plantId,
    parcelId,
  };
}

// ---- run -------------------------------------------------------------------

export async function deleteOwnedData(owners: mongoose.Types.ObjectId[]) {
  const [records, tasks, plants, parcels, tokens] = await Promise.all([
    AnalysisRecord.deleteMany({ owner: { $in: owners } }),
    Task.deleteMany({ owner: { $in: owners } }),
    Plant.deleteMany({ owner: { $in: owners } }),
    Parcel.deleteMany({ owner: { $in: owners } }),
    RefreshToken.deleteMany({ user: { $in: owners } }),
  ]);
  console.log(
    `removed ${tokens.deletedCount} tokens, ${parcels.deletedCount} parcels, ` +
      `${plants.deletedCount} plants, ${tasks.deletedCount} tasks, ${records.deletedCount} analysis records`,
  );
}

async function clearSeedData() {
  const users = await User.find({ email: new RegExp(`${SEED_DOMAIN.replace(".", "\\.")}$`) }).select("_id");
  const owners = users.map((u) => u._id);
  await deleteOwnedData(owners);
  await User.deleteMany({ _id: { $in: owners } });
  console.log(`removed ${owners.length} users`);
}

export type SeedTotals = { tokens: number; parcels: number; plants: number; tasks: number; records: number };

// Fills one user with a farm: tokens, parcels, plants, analysis records and tasks.
export async function seedUserData(user: { _id: unknown }): Promise<SeedTotals> {
  const totals: SeedTotals = { tokens: 0, parcels: 0, plants: 0, tasks: 0, records: 0 };

  const tokens = await RefreshToken.insertMany(refreshTokenDocs(user._id));
  totals.tokens += tokens.length;

  const farm: Point = {
    lat: REGION.lat + faker.number.float({ min: -REGION.spreadDeg, max: REGION.spreadDeg }),
    lng: REGION.lng + faker.number.float({ min: -REGION.spreadDeg, max: REGION.spreadDeg }),
  };
  const parcelCount = faker.number.int({ min: 1, max: 3 });
  const parcelSpecs = Array.from({ length: parcelCount }, (_, i) =>
    // parcels of one farm sit next to each other
    parcelDoc(user._id, { lat: farm.lat + i * 0.004, lng: farm.lng + faker.number.float({ min: 0, max: 0.004 }) }),
  );
  const parcels = await Parcel.insertMany(parcelSpecs.map(({ bounds: _bounds, ...doc }) => doc));
  totals.parcels += parcels.length;

  const plantDocs = [];
  const speciesOfPlant: Species[] = [];
  const tagsOfPlant: string[][] = [];
  for (const [i, parcel] of parcels.entries()) {
    const { bounds } = parcelSpecs[i]!;
    for (let n = faker.number.int({ min: 2, max: 5 }); n > 0; n--) {
      const species = faker.helpers.arrayElement(SPECIES);
      const photo = await fetchPhoto(species.photoPage);
      const tags = faker.helpers.arrayElements(TAGS, { min: 0, max: 3 });
      speciesOfPlant.push(species);
      tagsOfPlant.push(tags);
      plantDocs.push({
        owner: user._id,
        name: species.name,
        latinName: species.latin,
        careNote: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : undefined,
        tags,
        location: {
          lat: round6(faker.number.float({ min: bounds.south, max: bounds.north })),
          lng: round6(faker.number.float({ min: bounds.west, max: bounds.east })),
        },
        parcelId: parcel._id,
        photo: photo ?? undefined,
        photoUpdatedAt: photo ? new Date() : undefined,
      });
    }
  }
  const plants = await Plant.insertMany(plantDocs);
  totals.plants += plants.length;

  const records = await AnalysisRecord.insertMany(
    plants.flatMap((plant, i) => recordDocs(user._id, plant._id, speciesOfPlant[i]!, tagsOfPlant[i]!)),
  );
  totals.records += records.length;

  const tasks = await Task.insertMany(
    Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => {
      const plant = faker.helpers.arrayElement(plants);
      // a task belongs to a plant, its parcel, or both
      const target = faker.helpers.arrayElement(["plant", "parcel", "both"] as const);
      return taskDoc(user._id, target === "parcel" ? undefined : plant._id, target === "plant" ? undefined : plant.parcelId);
    }),
  );
  totals.tasks += tasks.length;

  return totals;
}

async function seed(userCount: number) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = await User.insertMany(userDocs(userCount, passwordHash));
  const totals: SeedTotals = { tokens: 0, parcels: 0, plants: 0, tasks: 0, records: 0 };

  for (const user of users) {
    const t = await seedUserData(user);
    for (const key of Object.keys(totals) as (keyof SeedTotals)[]) totals[key] += t[key];
  }

  console.log(
    `seeded ${users.length} users, ${totals.tokens} tokens, ${totals.parcels} parcels, ${totals.plants} plants ` +
      `(${[...photoCache.values()].filter(Boolean).length}/${photoCache.size} photos found), ` +
      `${totals.tasks} tasks, ${totals.records} analysis records`,
  );
  console.log(`login with any seed user, e.g. ${users[0]!.email} / ${SEED_PASSWORD}`);
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("the seeder refuses to run with NODE_ENV=production");
  }
  readDevEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  const args = process.argv.slice(2);
  const userCount = Number(args.find((a) => a.startsWith("--users="))?.split("=")[1] ?? 8);
  if (!Number.isInteger(userCount) || userCount < 1) throw new Error("--users must be a positive integer");

  await connectDB(uri);
  try {
    await clearSeedData();
    if (!args.includes("--clear")) await seed(userCount);
  } finally {
    await mongoose.disconnect();
  }
}

// importing this file (seed-user.ts) must not start a full seed
if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
