export type ParcelKind = "field" | "garden";
export type TaskRepeat = "none" | "daily" | "weekly" | "monthly";
export type AnalysisMode = "standard" | "rag";

export interface GeoPointDto {
  lat: number;
  lng: number;
}

export interface PlantDto {
  id: string;
  name: string;
  latinName?: string;
  careNote?: string;
  location?: GeoPointDto;
  parcelId?: string;
  // set when a photo is stored, GET /api/plants/:id/photo serves it
  photoUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParcelDto {
  id: string;
  name: string;
  kind: ParcelKind;
  // polygon corners as [lng, lat], the ring is not closed
  polygon: [number, number][];
  notes?: string;
  plantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRecordDto {
  id: string;
  plantId?: string;
  mode: AnalysisMode;
  tags: string[];
  // PlantAnalysis and PlantRiskAssessment as returned by /api/plan-analysis
  analysis: Record<string, unknown>;
  assessment: Record<string, unknown>;
  sources: Record<string, unknown>[];
  createdAt: string;
}

export interface TaskDto {
  id: string;
  title: string;
  notes?: string;
  dueDate: string;
  done: boolean;
  doneAt?: string;
  repeat: TaskRepeat;
  plantId?: string;
  parcelId?: string;
  createdAt: string;
}

// data of POST /api/tasks/:id/complete
export interface TaskCompletionDto {
  task: TaskDto;
  // the next occurrence of a repeating task
  next: TaskDto | null;
}
