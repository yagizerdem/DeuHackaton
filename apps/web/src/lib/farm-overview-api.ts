import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse } from "@DeparkHackaton/shared";
import type {
  BoardTaskDto,
  PlantOverviewDto,
  TaskStatus,
} from "@DeparkHackaton/dto";
import API from "@/lib/axios-wrapper";
import { getApiErrorMessage } from "@/lib/api-error";

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>) {
  return (await request).data.data as T;
}

export const usePlantOverview = () =>
  useQuery({
    queryKey: ["plant-overview"],
    queryFn: () => unwrap<PlantOverviewDto[]>(API.get("/farm/plants")),
  });

export const useBoard = () =>
  useQuery({
    queryKey: ["board"],
    queryFn: () => unwrap<BoardTaskDto[]>(API.get("/farm/board")),
  });

// plain requests for the undoable delete, the toast there says what happened
export const requestDeletePlant = (id: string) => API.delete(`/plants/${id}`);
export const requestDeleteTask = (id: string) => API.delete(`/tasks/${id}`);

export function useTagPlants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { ids: string[]; add?: string[]; remove?: string[] }) =>
      API.patch("/farm/plants/tags", input),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Etiketler güncellenemedi")),
  });
}

// The card moves right away and goes back if the server refuses.
export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      API.patch(`/farm/tasks/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["board"] });
      const previous = queryClient.getQueryData<BoardTaskDto[]>(["board"]);
      queryClient.setQueryData<BoardTaskDto[]>(["board"], (tasks) =>
        tasks?.map((task) =>
          task.id === id ? { ...task, status, done: status === "done" } : task,
        ),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(["board"], context?.previous);
      toast.error(getApiErrorMessage(error, "Görev taşınamadı"));
    },
    // finishing a repeating task adds a new one, and plant task counts change
    onSettled: () => queryClient.invalidateQueries(),
  });
}
