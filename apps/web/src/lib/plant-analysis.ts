import API from "@/lib/axios-wrapper";
import { type ApiResponse } from "@DeparkHackaton/shared";

export interface PlantAnalysis {
  isPlant: boolean;
  species: {
    commonName: string;
    latinName: string;
    family: string;
    confidence: number;
  };
  symptoms: string[];
  suspectedPestsAndDiseases: {
    latinName: string;
    commonName: string;
    type: "insect" | "fungus" | "bacteria" | "virus" | "other";
    reason: string;
  }[];
  invasiveThreats: { latinName: string; commonName: string }[];
  protectiveMeasures: string[];
  summary: string;
}

export interface PlantRiskAssessment {
  severity: "none" | "low" | "medium" | "high" | "critical";
  urgency: "monitor" | "within_weeks" | "within_days" | "immediate";
  spreadRisk: string;
  treatmentPlan: { step: string; timing: string }[];
  monitoring: string[];
  reportToAuthorities: boolean;
  rationale: string;
}

export interface PlantAnalysisResult {
  analysis: PlantAnalysis;
  assessment: PlantRiskAssessment;
}

function imageForm(image: File) {
  const body = new FormData();
  body.append("image", image);
  return body;
}

export async function analyzePlantImage(image: File) {
  const response = await API.post<ApiResponse<PlantAnalysisResult>>(
    "/plan-analysis",
    imageForm(image),
  );
  return response.data.data!;
}

// same response as analyzePlantImage, the assessment is grounded in the knowledge base
export async function analyzePlantImageWithRag(image: File) {
  const response = await API.post<ApiResponse<PlantAnalysisResult>>(
    "/plan-analysis/rag",
    imageForm(image),
  );
  return response.data.data!;
}
