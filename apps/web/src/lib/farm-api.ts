import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse } from "@DeparkHackaton/shared";
import type {
  AnalysisRecordDto,
  ParcelDto,
  PlantDto,
  TaskCompletionDto,
  TaskDto,
} from "@DeparkHackaton/dto";
import type {
  AnalysisRecordUpdateInput,
  ParcelInput,
  ParcelUpdateInput,
  PlantInput,
  PlantUpdateInput,
  TaskInput,
  TaskUpdateInput,
} from "@DeparkHackaton/validators";
import API from "@/lib/axios-wrapper";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PlantAnalysisResult } from "@/lib/plant-analysis";

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  return (await request).data.data as T;
}

function useList<T>(queryKey: QueryKey, path: string) {
  return useQuery({
    queryKey,
    queryFn: () => unwrap<T[]>(API.get(path)),
  });
}

// Every write refreshes all lists: deleting a plant also changes the parcel
// counts, tasks and records, so tracking each dependency is not worth it.
function useWrite<TVars, TData>(
  request: (vars: TVars) => Promise<TData>,
  success?: string | ((data: TData) => string | undefined),
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (data) => {
      const message = typeof success === "function" ? success(data) : success;
      if (message) toast.success(message);
      return queryClient.invalidateQueries();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Request failed")),
  });
}

function imageForm(image: File) {
  const body = new FormData();
  body.append("image", image);
  return body;
}

export const photoUrl = (plant: PlantDto) =>
  plant.photoUpdatedAt
    ? `${API.defaults.baseURL}/plants/${plant.id}/photo?v=${encodeURIComponent(plant.photoUpdatedAt)}`
    : undefined;

// plants

export const usePlants = () => useList<PlantDto>(["plants"], "/plants");

export const useCreatePlant = () =>
  useWrite(
    (input: PlantInput) => unwrap<PlantDto>(API.post("/plants", input)),
    "Plant added",
  );

export const useUpdatePlant = () =>
  useWrite(
    ({ id, patch }: { id: string; patch: PlantUpdateInput }) =>
      unwrap<PlantDto>(API.patch(`/plants/${id}`, patch)),
    "Plant saved",
  );

export const useDeletePlant = () =>
  useWrite((id: string) => API.delete(`/plants/${id}`), "Plant deleted");

export const useSetPlantPhoto = () =>
  useWrite(({ id, image }: { id: string; image: File }) =>
    unwrap<PlantDto>(API.put(`/plants/${id}/photo`, imageForm(image))),
  );

export const useRemovePlantPhoto = () =>
  useWrite((id: string) => API.delete(`/plants/${id}/photo`));

// parcels

export const useParcels = () => useList<ParcelDto>(["parcels"], "/parcels");

export const useCreateParcel = () =>
  useWrite(
    (input: ParcelInput) => unwrap<ParcelDto>(API.post("/parcels", input)),
    "Parcel added",
  );

export const useUpdateParcel = () =>
  useWrite(
    ({ id, patch }: { id: string; patch: ParcelUpdateInput }) =>
      unwrap<ParcelDto>(API.patch(`/parcels/${id}`, patch)),
    "Parcel saved",
  );

export const useDeleteParcel = () =>
  useWrite((id: string) => API.delete(`/parcels/${id}`), "Parcel deleted");

// analysis records

export const useAnalysisRecords = () =>
  useList<AnalysisRecordDto>(["analysis-records"], "/analysis-records");

export interface SaveRecordInput extends PlantAnalysisResult {
  mode: "standard" | "rag";
  plantId?: string | null;
  tags?: string[];
}

export const useCreateAnalysisRecord = () =>
  useWrite(
    (input: SaveRecordInput) =>
      unwrap<AnalysisRecordDto>(API.post("/analysis-records", input)),
    "Saved to your records",
  );

export const useUpdateAnalysisRecord = () =>
  useWrite(
    ({ id, patch }: { id: string; patch: AnalysisRecordUpdateInput }) =>
      unwrap<AnalysisRecordDto>(API.patch(`/analysis-records/${id}`, patch)),
  );

export const useDeleteAnalysisRecord = () =>
  useWrite(
    (id: string) => API.delete(`/analysis-records/${id}`),
    "Record deleted",
  );

// tasks

export const useTasks = () => useList<TaskDto>(["tasks"], "/tasks");

export const useCreateTask = () =>
  useWrite(
    (input: TaskInput) => unwrap<TaskDto>(API.post("/tasks", input)),
    "Task added",
  );

export const useUpdateTask = () =>
  useWrite(
    ({ id, patch }: { id: string; patch: TaskUpdateInput }) =>
      unwrap<TaskDto>(API.patch(`/tasks/${id}`, patch)),
  );

export const useCompleteTask = () =>
  useWrite(
    (id: string) =>
      unwrap<TaskCompletionDto>(API.post(`/tasks/${id}/complete`)),
    ({ next }) =>
      next
        ? `Done. Next one is due ${new Date(next.dueDate).toLocaleDateString()}`
        : "Task done",
  );

export const useDeleteTask = () =>
  useWrite((id: string) => API.delete(`/tasks/${id}`), "Task deleted");
