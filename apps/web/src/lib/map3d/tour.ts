import type { BoardTaskDto, PlantOverviewDto } from "@DeparkHackaton/dto";
import { distanceKm, type LatLng } from "@/lib/map3d/geometry";

export interface TourStop extends LatLng {
  plantId: string;
  plantName: string;
  tasks: string[];
}

/** Tasks that are not done and are due before the end of today (overdue ones too). */
export function dueToday(tasks: BoardTaskDto[], now = new Date()): BoardTaskDto[] {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return tasks.filter(
    (task) => task.status !== "done" && new Date(task.dueDate) <= endOfDay,
  );
}

/** One stop per plant that has a location, with the tasks waiting there. */
export function tourStops(
  tasks: BoardTaskDto[],
  plants: PlantOverviewDto[],
): TourStop[] {
  const byPlant = new Map<string, string[]>();
  for (const task of tasks) {
    if (!task.plantId) continue;
    byPlant.set(task.plantId, [...(byPlant.get(task.plantId) ?? []), task.title]);
  }
  return plants.flatMap((plant) =>
    plant.location && byPlant.has(plant.id)
      ? [
          {
            ...plant.location,
            plantId: plant.id,
            plantName: plant.name,
            tasks: byPlant.get(plant.id)!,
          },
        ]
      : [],
  );
}

/** Walking order: always continue with the nearest stop that is left. */
export function orderStops(stops: TourStop[], start?: LatLng): TourStop[] {
  const left = [...stops];
  const ordered: TourStop[] = [];
  let from = start ?? left[0];
  while (left.length && from) {
    let best = 0;
    for (let i = 1; i < left.length; i++) {
      if (distanceKm(from, left[i]!) < distanceKm(from, left[best]!)) best = i;
    }
    const [next] = left.splice(best, 1);
    ordered.push(next!);
    from = next;
  }
  return ordered;
}

export const routeLengthKm = (stops: LatLng[]) =>
  stops.slice(1).reduce((sum, stop, i) => sum + distanceKm(stops[i]!, stop), 0);
