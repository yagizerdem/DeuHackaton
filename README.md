# Plant Protection Assistant

A web application that identifies plant species from a photo, assesses pests and diseases, and generates protection recommendations backed by a knowledge base (RAG). It also includes a 2D risk map showing forest fire danger.

> Depark Hackathon project. Monorepo: React frontend, Express API, and a Flask-based RAG service running in Docker.

## Contents

- [Project scope](#project-scope)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Repository structure](#repository-structure)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [API endpoints](#api-endpoints)
- [RAG service](#rag-service)
- [Cost](#cost)
- [Development notes](#development-notes)
- [Known limitations](#known-limitations)
- [License](#license)

## Project scope

**Problem:** Plant health decisions (suspecting a pest, reporting a species on a quarantine list, deciding when to intervene) rely on scattered sources: EPPO lists, ministry instructions, academic guides. Bringing these together quickly and traceably is hard for field users.

**Solution:** The user uploads a plant photo. The system produces two separate results and shows them side by side:

1. **Standard analysis:** The image is interpreted by Gemini (species, symptoms, suspected pests/diseases, invasive threats) and a risk assessment is produced (severity, urgency, spread risk, action plan, monitoring, whether authorities must be notified).
2. **Knowledge base analysis:** A search query is built from the same diagnosis, relevant pages are retrieved from the PDF knowledge base (EPPO datasheets, Turkish Ministry of Agriculture and Forestry instructions, FAO guides, etc.), and the risk assessment is grounded in those pages.

### Features

- **Image analysis:** single image upload (JPEG, PNG, WebP, HEIC/HEIF, up to 10 MB), structured JSON output.
- **RAG-backed assessment:** summary-based retrieval (multi-vector approach): the page summary is searched, the raw page text is returned.
- **Authentication:** register, login, logout, token refresh; access + refresh JWTs, refresh token rotation, and family revocation on reuse detection.
- **2D risk map** (`/2dmap`): [GWIS](https://gwis.jrc.ec.europa.eu/) WMS layers (fire weather index, etc.) on Leaflet. Clicking a point analyses the vegetation around it.
- **3D map** (`/3dmap`, CesiumJS): one globe for the whole farm, see [3D map](#3d-map).
- **API documentation:** Swagger UI (`/api-docs`).
- **Dark/light theme** and a UI adapted from the Stitch design.

## 3D map

`/3dmap` shows everything about the farm on one CesiumJS globe. Every layer can be switched on and off in the side panel.

| Layer | What it shows |
|---|---|
| Parcels | Polygons draped over the terrain, colored by the worst plant status inside. Click one to fly there and read its elevation, slope and aspect with a short interpretation (a south-facing slope dries faster, and so on) |
| Extruded parcels | The same parcels as prisms. The height is the problem density: critical plants ×3, plants in treatment ×2, watched plants ×1, open tasks ×0.5 (20 to 400 m) |
| Plant pins and poles | A pin per plant tinted by its health, critical ones pulse, close pins merge into numbered clusters. Poles are taller for a worse status. Click a pin for the photo, last analysis and open tasks |
| Invasive species | GBIF observations around the farm as 3D points, height and color show the year, inside a translucent dome that marks the analysis radius |
| Time line | Cesium's own animation and timeline widgets. The pins read the clock, so playing it replays how the plants' health changed from the analysis records |
| Fire | GWIS burnt areas (last 30 days) and fire weather index draped over the terrain, with the distance to the nearest burnt area |
| Land cover | CORINE 2018 classes (forest, pasture, farmland, built-up) |
| 3D buildings | OSM Buildings or Google photorealistic tiles, needs `VITE_CESIUM_ION_TOKEN` |
| Field tour | A route through the plants that have tasks due today, in walking order, and a camera flight along it |
| Draw tool | Draw a polygon on the globe and get its area, elevation, slope, aspect and the land cover around it at once, then save it as a parcel |

Elevation, slope and aspect come from Cesium terrain when the globe has it (`sampleTerrainMostDetailed`), and from the free Open-Meteo elevation service otherwise. Slope and aspect are read from the 300 m around a parcel, because the elevation models (30 to 90 m cells) cannot resolve a small plot.

## Architecture

```mermaid
flowchart LR
    U[User] --> W[Web<br/>React + Vite :5000]
    W -->|/api| B[Backend<br/>Express :3000]
    B --> M[(MongoDB)]
    B -->|image analysis, risk assessment| G[Gemini API]
    B -->|/query| R[RAG<br/>Flask :5001]
    R --> C[(Chroma<br/>persistent volume)]
    R -->|summary + embedding| G
```

**Flow of a `/api/plan-analysis/rag` request:**

1. The backend sends the image to Gemini and receives a structured diagnosis.
2. A search query is built from the diagnosis (species name + suspected pests + symptoms).
3. The RAG service embeds the query and returns the closest pages from Chroma.
4. The backend passes these pages to Gemini as context and has it produce a risk assessment.

The retrieved pages only feed the assessment; they are **not returned** in the API response.

## Technologies

| Layer | Technologies |
|---|---|
| Web | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Base UI), React Router, TanStack Query, Axios, Leaflet |
| Backend | Node.js, Express 5, TypeScript (NodeNext ESM), Mongoose 9, JWT, bcrypt, Zod 4, Multer, swagger-jsdoc, `@google/genai` |
| RAG | Python 3.12, Flask + Gunicorn, ChromaDB, pypdf, `google-genai` |
| Models | Gemini 3.8 Flash (analysis/summarization), `gemini-embedding-2` (768 dimensions, embedding) |
| Infrastructure | Docker Compose (MongoDB, Mongo Express, RAG), npm workspaces |

## Repository structure

```
.
├── apps/
│   ├── backend/        Express API (auth, image analysis, RAG client, Swagger)
│   └── web/            React frontend
├── packages/
│   ├── shared/         ApiResponse, HttpStatusCode, shared types
│   ├── validators/     Zod schemas (register, login)
│   └── dto/            API response types
├── rag/                Flask RAG service (Dockerfile, ingest.py, app.py)
│   ├── data/           Knowledge base PDFs (not committed to git)
│   └── model.ipynb     First RAG experiment (Colab notebook)
├── docs/               GWIS WMS capabilities
├── plant_id/           Plant.id API test scripts
├── compose.yaml        MongoDB, Mongo Express, RAG
└── tsconfig.base.json
```

## Setup

### Requirements

- Node.js 22 (development environment v22.23) and npm
- Docker Desktop (for MongoDB and RAG)
- A **Gemini API key** ([Google AI Studio](https://aistudio.google.com/)) with billing enabled

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/yagizerdem/DeuHackaton.git
cd DeuHackaton
npm install
```

### 2. Build the shared packages

The packages run from their `dist` folders. After cloning and every time you change package code:

```bash
npx tsc -b packages/shared packages/validators packages/dto
```

### 3. Create the environment files

These files are in `.gitignore`, so you need to create them yourself. The meaning of each variable is in the [table below](#environment-variables).

**`apps/backend/.env.dev`**

```env
PORT=3000
MONGODB_URI=mongodb://user:1234@localhost:27017/depark-hackaton?authSource=admin
JWT_SECRET=<a long random value>
JWT_Issuer=depark-hackaton
JWT_Audience=depark-hackaton-users
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=60d
CORS_ORIGIN=http://localhost:5000
GEMINI_API_KEY=<your key>
```

**`apps/web/.env`**

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**`rag/.env`**

```env
GOOGLE_API_KEY=<your key>
```

### 4. Start the Docker services

```bash
docker compose up -d --build
```

| Service | Address |
|---|---|
| MongoDB | `localhost:27017` |
| Mongo Express | http://localhost:8081 |
| RAG (Flask) | http://localhost:5001 |

> The MongoDB passwords in `compose.yaml` (`user` / `1234`) are for local development only. Change them before deploying to a server.

### 5. Build the knowledge base (optional, but required for RAG)

Put the PDFs in `rag/data/`, then index them:

```bash
docker compose run --rm rag python ingest.py
docker compose restart rag
```

See the [RAG service](#rag-service) and [Cost](#cost) sections for details and cost. If the index is empty, `/query` returns 503 and `/api/plan-analysis/rag` does not work.

### 6. Run the development servers

In two separate terminals:

```bash
npm run dev -w @DeparkHackaton/backend   # http://localhost:3000
npm run dev -w @DeparkHackaton/web       # http://localhost:5000
```

Then:

- App: http://localhost:5000
- Swagger UI: http://localhost:3000/api-docs
- Health check: http://localhost:3000/health

If you use VS Code, `.vscode/launch.json` contains a debug configuration for the backend.

### Production build

```bash
npm run build -w @DeparkHackaton/backend   # tsc + tsc-alias
npm run start -w @DeparkHackaton/backend   # NODE_ENV=production, reads .env.prod
```

`.env.prod` must contain the same variables as `.env.dev`. In particular, `CORS_ORIGIN` (the production web address), `GEMINI_API_KEY` and, if needed, `RAG_URL` must be added; without them CORS falls back to the default and image analysis does not work.

## Environment variables

### Backend (`apps/backend/.env.dev` / `.env.prod`)

| Variable | Description |
|---|---|
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing key |
| `JWT_Issuer`, `JWT_Audience` | JWT `iss` and `aud` values |
| `ACCESS_TOKEN_EXPIRATION`, `REFRESH_TOKEN_EXPIRATION` | Token lifetimes (e.g. `15m`, `60d`) |
| `CORS_ORIGIN` | Allowed origins, comma-separated (default `http://localhost:5000`) |
| `GEMINI_API_KEY` | For image analysis and risk assessment |
| `RAG_URL` | RAG service address (default `http://localhost:5001`) |

### Web (`apps/web/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API base URL, ends with `/api` |
| `VITE_CESIUM_ION_TOKEN` | Optional. A free [Cesium ion](https://ion.cesium.com/) token turns on Cesium World Terrain, OSM 3D buildings and Google photorealistic tiles in the 3D map. Without it the globe is flat on OpenStreetMap imagery |

### RAG (`rag/.env`)

| Variable | Default | Description |
|---|---|---|
| `GOOGLE_API_KEY` (or `GEMINI_API_KEY`) | | For summarization and embedding |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Page summarization model |
| `EMBEDDING_MODEL` | `gemini-embedding-2` | Embedding model |
| `EMBEDDING_DIMS` | `768` | Vector dimensions |
| `INGEST_WORKERS` | `16` | Parallel summarization calls |
| `EMBED_WORKERS` | `8` | Parallel embedding calls |
| `AUTO_INGEST` | off | If `1`, the container indexes on every start |

Values such as `PROJECT_ID` and `REGION` in `rag/.env` are only used by `rag/model.ipynb`.

## API endpoints

All responses have the shape `{ httpStatusCode, message, data?, formErrors? }`. Detailed schemas are in Swagger UI.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | | Service and database status |
| GET | `/api-docs` | | Swagger UI |
| POST | `/api/auth/register` | | Register |
| POST | `/api/auth/login` | | Login (token pair + cookie) |
| POST | `/api/auth/logout` | | Logout (clears cookies) |
| POST | `/api/auth/refresh` | | Token refresh (rotation) |
| GET | `/api/auth/me` | ✔ | Signed-in user |
| POST | `/api/plan-analysis` | ✔ | Image analysis + risk assessment |
| POST | `/api/plan-analysis/rag` | ✔ | Same, with knowledge-base-grounded assessment |

The image endpoints expect `multipart/form-data` with a single `image` field:

```bash
curl -X POST http://localhost:3000/api/plan-analysis/rag \
  -H "Authorization: Bearer <accessToken>" \
  -F "image=@leaf.jpg"
```

Error codes: `401` unauthorized, `413` image larger than 10 MB, `415` unsupported type, `503` Gemini or the RAG service is unreachable.

## RAG service

The `rag/` folder is a standalone Flask application. "Training" here is not model training but **indexing**: no model weights change.

### Indexing (`ingest.py`)

For every page of every PDF under `rag/data/`:

1. Text is extracted with `pypdf` (there is no OCR; pages whose text cannot be extracted are skipped).
2. Gemini turns the page into a structured English summary (`rag/prompts.py`).
3. The summary is converted to a vector with `gemini-embedding-2`.
4. The vector, the raw page text and the summary are written to Chroma.

Search runs **over the summary**; what comes back is the **raw page text**. Since the page ID is `file name + page number`, already indexed pages are skipped and the command can safely be re-run. Summaries are generated with 16 parallel calls; a page that fails is skipped and retried on the next run.

> If you change a PDF's content, the page ID stays the same, so the old summary remains. Rename the file, or delete the `rag_chroma` volume and re-index from scratch.

### Query

```bash
curl -X POST http://localhost:5001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How does Ceratocystis platani spread", "k": 5}'
```

Response: `results[]` containing `source`, `page`, `score` (similarity), `summary` and `text`. `k` is between 1 and 20.

### Persistence

The index is stored in the Docker volume named `rag_chroma`. Deleting or restarting the container, or rebuilding the image, does not delete the index. **`docker compose down -v` deletes it** (MongoDB data is lost the same way).

### Knowledge base sources

The PDFs are in `.gitignore` and are not in the repository. The prepared knowledge base consists of the following sources:

- **EPPO:** A1/A2 quarantine lists and various pest datasheets (*Anoplophora*, *Ceratocystis platani*, *Rhynchophorus ferrugineus*, *Xylella fastidiosa*, *Popillia japonica*, etc.)
- **Turkish Ministry of Agriculture and Forestry:** list of notifiable pests, integrated olive pest management instruction, red palm weevil instructions
- **General Directorate of Forestry:** Communiqué No. 305 (control of forest pests)
- **FAO:** guide to phytosanitary standards in forestry and IPM manuals
- University lecture notes and open-access articles

You can extend the knowledge base by putting your own documents in `rag/data/` and running the indexing command above. Check the redistribution terms of the documents you use.

## Cost

Gemini usage is paid. The figures below are **estimates** based on price aggregator sites (not verified against the official Google pricing page):

- Page indexing: about **$0.008 / page**. ~95% of this is summarization; the embedding share is very small. Thinking tokens are not included in this estimate and can increase the cost.
- Each `/api/plan-analysis/rag` request calls Gemini **3 times** (image analysis, question embedding, risk assessment). Because "Analyze plant" in the UI runs both boxes at once, it makes 5 calls in total.
- When the balance runs out, Gemini returns `402 RESOURCE_EXHAUSTED`. In that case indexing stops midway and the API endpoints return `503`. Indexing is not automatic, so the container does not spend credits even if the balance runs out.

## Development notes

- **Package builds:** `packages/*` contents are consumed through `dist`. After changing a file in a package, `npx tsc -b packages/shared packages/validators packages/dto` must be re-run. The root `npm run dev` (`tsc -b --watch`) does not watch the packages.
- **Path aliases:** the backend uses aliases such as `@/*`, `@utils/*` and `@services/*`. They are resolved by `tsx` in development and by `tsc-alias` in builds. `tsx` does not type-check; run `npm run type-check -w @DeparkHackaton/backend`.
- **Environment files load late:** the backend reads the `.env` file in `server.ts`, after the imports have been evaluated. Therefore environment variables must be read at call time, not at module load time.
- **UI design:** design tokens derived from the Google Stitch project are defined as `stitch-*` variables in `apps/web/src/index.css`. Components live under `apps/web/src/components/`, and reusable shadcn/ui components are in `components/ui/`. See `AGENTS.md` and the `DESIGN-*.md` files for details.
- **Commit messages:** Conventional Commits (`feat(web): ...`, `fix(backend): ...`).

## Known limitations

- **No RAG relevance threshold:** the system always retrieves the closest pages, no matter how far away they are. For a plant not in the corpus (e.g. palm), irrelevant pages (score ~0.52) can leak into the assessment. Real matches score ~0.70 and above.
- **Limited corpus coverage:** mostly plane trees, *Anoplophora*, forest pests and olive. The knowledge base adds nothing for out-of-scope plants.
- **No OCR:** scanned (image) PDF pages are not indexed.
- **Evaluation not measured:** metrics such as Recall@k, MRR and faithfulness have not been measured for RAG yet.
- **Duplicate Gemini calls:** the two result boxes analyze the same image separately, which increases cost and latency.
- **Web build:** `npm run build -w @DeparkHackaton/web` fails with a `TS6133` error because of an unused `React` import in `components/ui/scroll-area.tsx`.
- **No tests:** there is no automated test suite.
- **Accuracy of responses:** the outputs are a decision support tool and do not replace expert opinion or official notification.

## License

MIT, see [License.txt](License.txt).
