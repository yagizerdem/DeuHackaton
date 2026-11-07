import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { AppError } from "@utils/app-error.js";

const SYSTEM_INSTRUCTION = `You are a plant protection expert. Analyze the plant in the image.
Output only the requested JSON data, written in Turkish. Do not add greetings, introductions, apologies, disclaimers or any filler text.
Every field must be factual, specific and self-contained, because the output is stored and used as retrieval data.
Use Latin binomial names for every species, pest and pathogen. Use empty arrays for anything not visible or not applicable, never placeholders.
If the image does not contain a plant, set isPlant to false and leave every other field empty.`;

// Output shape consumed by the RAG step: Latin names and a ready search query.
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
  retrievalQuery: z.string(),
});

export type PlantAnalysis = z.infer<typeof plantAnalysisSchema>;

// strip the draft marker, the Gemini schema parser does not accept it
const { $schema: _draft, ...responseJsonSchema } =
  z.toJSONSchema(plantAnalysisSchema);

const ANALYSIS_PROMPT =
  "Analyze this image. Fill retrievalQuery with one dense sentence of Latin species names, symptoms and pests that can be used as a search query over plant protection literature.";

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

export async function analyzePlantImage(
  image: Buffer,
  mimeType: string,
): Promise<PlantAnalysis> {
  let text: string | undefined;
  try {
    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: ANALYSIS_PROMPT },
            { inlineData: { mimeType, data: image.toString("base64") } },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema,
        temperature: 0.2,
        // extraction task, deep reasoning only adds latency
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
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
  const parsed = plantAnalysisSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Unexpected Gemini output:", parsed.error);
    throw AppError.unprocessableEntity("The image could not be analyzed");
  }
  return parsed.data;
}
