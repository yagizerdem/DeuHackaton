import { GoogleGenAI, ThinkingLevel, type Part } from "@google/genai";
import { z } from "zod";
import { AppError } from "@utils/app-error.js";

const SYSTEM_INSTRUCTION = `You are a plant protection expert. Analyze the plant in the image.
Output only the requested JSON data, written in Turkish. Do not add greetings, introductions, apologies, disclaimers or any filler text.
Every field must be factual and specific. Do not invent sources or citations.
Use Latin binomial names for every species, pest and pathogen. Use empty arrays for anything not visible or not applicable, never placeholders.
If the image does not contain a plant, set isPlant to false and leave every other field empty.`;

export const plantAnalysisSchema = z.object({
  isPlant: z.boolean(),
  species: z.object({
    commonName: z.string(),
    latinName: z.string(),
    family: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  symptoms: z.array(z.string()),
  suspectedPestsAndDiseases: z.array(
    z.object({
      latinName: z.string(),
      commonName: z.string(),
      type: z.enum(["insect", "fungus", "bacteria", "virus", "other"]),
      reason: z.string(),
    }),
  ),
  invasiveThreats: z.array(
    z.object({ latinName: z.string(), commonName: z.string() }),
  ),
  protectiveMeasures: z.array(z.string()),
  summary: z.string(),
});

export type PlantAnalysis = z.infer<typeof plantAnalysisSchema>;

export const plantRiskAssessmentSchema = z.object({
  severity: z.enum(["none", "low", "medium", "high", "critical"]),
  urgency: z.enum(["monitor", "within_weeks", "within_days", "immediate"]),
  spreadRisk: z.string(),
  treatmentPlan: z.array(z.object({ step: z.string(), timing: z.string() })),
  monitoring: z.array(z.string()),
  reportToAuthorities: z.boolean(),
  rationale: z.string(),
});

export type PlantRiskAssessment = z.infer<typeof plantRiskAssessmentSchema>;

const ASSESSMENT_INSTRUCTION = `You are a plant protection advisor. You receive a JSON plant diagnosis.
Output only the requested JSON data, written in Turkish, with no filler text.
Rate severity and urgency from the symptoms and suspected causes. spreadRisk: how likely it is to spread to nearby plants.
treatmentPlan: ordered concrete steps, each with timing. monitoring: what to re-check and when.
Set reportToAuthorities true only for invasive or quarantine-relevant threats. rationale: one or two sentences.
If isPlant is false, use severity "none", urgency "monitor" and empty arrays.
If reference excerpts are provided, ground the treatment plan and monitoring in them and do not contradict them. Do not invent sources or citations beyond the excerpts.`;

const ANALYSIS_PROMPT =
  "Analyze this image. Fill summary with a short plain-text assessment of the plant's condition and the most important action to take.";

// keeps the assessment prompt small when a knowledge base page is long
const MAX_EXCERPT_CHARS = 2000;

const GEMINI_MODEL = "gemini-3.8-flash";

let client: GoogleGenAI | null = null;

// created lazily so the env file is already loaded and the server can boot without a key
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw AppError.serviceUnavailable("Image analysis is not configured");
  }
  client ??= new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });
  return client;
}

// One structured-output Gemini call, validated against the zod schema.
async function generateJson<S extends z.ZodType>(
  schema: S,
  parts: Part[],
  systemInstruction: string,
): Promise<z.infer<S>> {
  // strip the draft marker, the Gemini schema parser does not accept it
  const { $schema: _draft, ...responseJsonSchema } = z.toJSONSchema(schema);

  let text: string | undefined;
  try {
    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema,
        temperature: 0.2,
        // extraction task, deep reasoning only adds latency
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    text = response.text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Gemini request failed:", error);
    throw AppError.serviceUnavailable("Image analysis failed, try again later");
  }

  if (!text) {
    throw AppError.unprocessableEntity("The image could not be analyzed");
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error("Unexpected Gemini output:", parsed.error);
    throw AppError.unprocessableEntity("The image could not be analyzed");
  }
  return parsed.data;
}

export function analyzePlantImage(
  image: Buffer,
  mimeType: string,
): Promise<PlantAnalysis> {
  return generateJson(
    plantAnalysisSchema,
    [
      { text: ANALYSIS_PROMPT },
      { inlineData: { mimeType, data: image.toString("base64") } },
    ],
    SYSTEM_INSTRUCTION,
  );
}

// Second pass: turns the diagnosis into a severity rating and an action plan.
// With sources (see queryRag) the plan is grounded in those knowledge base pages.
export function assessPlantRisk(
  analysis: PlantAnalysis,
  sources: RagResult[] = [],
): Promise<PlantRiskAssessment> {
  const excerpts = sources
    .map(
      (r, i) =>
        `[${i + 1}] ${r.source}, page ${r.page}:\n${r.text.slice(0, MAX_EXCERPT_CHARS)}`,
    )
    .join("\n\n");

  const diagnosis = `Diagnosis:\n${JSON.stringify(analysis)}`;
  const prompt = excerpts
    ? `${diagnosis}\n\nReference excerpts:\n${excerpts}`
    : diagnosis;

  return generateJson(
    plantRiskAssessmentSchema,
    [{ text: prompt }],
    ASSESSMENT_INSTRUCTION,
  );
}

export type RagResult = {
  source: string;
  page: number;
  score: number;
  summary: string;
  text: string;
};

// Builds the RAG search query from the analysis: species, symptoms and suspected pests.
export function buildRetrievalQuery(analysis: PlantAnalysis): string {
  return [
    analysis.species.latinName,
    ...analysis.suspectedPestsAndDiseases.map((p) => p.latinName),
    ...analysis.symptoms,
  ]
    .filter(Boolean)
    .join(". ");
}

// Searches the dockerized RAG service (rag/app.py) for plant protection pages.
export async function queryRag(query: string, k = 5): Promise<RagResult[]> {
  const ragUrl = process.env.RAG_URL ?? "http://localhost:5001";
  let response: Response;
  try {
    response = await fetch(`${ragUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, k }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw AppError.serviceUnavailable("Knowledge base is unreachable");
  }

  if (!response.ok) {
    throw AppError.serviceUnavailable("Knowledge base query failed");
  }

  const { results } = (await response.json()) as { results: RagResult[] };
  return results;
}
