import API from "@/lib/axios-wrapper";
import { type ApiResponse } from "@DeparkHackaton/shared";

/** Radius of the analysed circle around the clicked point. */
export const VEGETATION_RADIUS_KM = 1;

export type LandCoverGroup =
  | "artificial"
  | "agricultural"
  | "forest"
  | "natural_vegetation"
  | "sparse"
  | "wetland"
  | "water";

export interface LandCoverClassShare {
  code: string;
  label: string;
  group: LandCoverGroup;
  vegetated: boolean;
  percent: number;
}

export interface VegetationAnalysis {
  location: { lat: number; lon: number; radiusKm: number };
  landCover: {
    source: string;
    year: number;
    coveragePercent: number;
    vegetationPercent: number;
    classes: LandCoverClassShare[];
    groups: { group: LandCoverGroup; label: string; percent: number }[];
  } | null;
  species: {
    source: string;
    totalOccurrences: number;
    items: { name: string; count: number }[];
  } | null;
  terrain: { elevationM: number } | null;
  climate: { year: number; meanTempC: number; annualPrecipMm: number } | null;
  summary: string[];
  unavailable: string[];
}

export async function fetchVegetation(
  lat: number,
  lon: number,
  signal?: AbortSignal,
) {
  const response = await API.get<ApiResponse<VegetationAnalysis>>("/vegetation", {
    params: { lat, lon, radiusKm: VEGETATION_RADIUS_KM },
    signal,
  });
  return response.data.data!;
}
