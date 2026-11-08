export interface InvasiveObservationDto {
  // GBIF occurrence key
  id: string;
  species: string;
  year: number;
  lat: number;
  lng: number;
  // distance to the analysed point
  distanceKm: number;
}

export interface InvasiveSpeciesCountDto {
  species: string;
  count: number;
  nearestKm: number;
}

// data of GET /api/invasive-species
export interface InvasiveSpeciesMapDto {
  center: { lat: number; lng: number };
  radiusKm: number;
  observations: InvasiveObservationDto[];
  // one row per species, closest first
  species: InvasiveSpeciesCountDto[];
  nearest: InvasiveObservationDto | null;
  yearRange: { min: number; max: number } | null;
  // more observations exist than were returned
  truncated: boolean;
  source: "GBIF";
}
