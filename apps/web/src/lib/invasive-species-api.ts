import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@DeparkHackaton/shared";
import type { InvasiveSpeciesMapDto } from "@DeparkHackaton/dto";
import API from "@/lib/axios-wrapper";

export interface MapCenter {
  lat: number;
  lng: number;
}

export function useInvasiveSpecies(center: MapCenter, radiusKm: number) {
  return useQuery({
    queryKey: ["invasive-species", center.lat, center.lng, radiusKm],
    queryFn: async () => {
      const response = await API.get<ApiResponse<InvasiveSpeciesMapDto>>(
        "/invasive-species",
        { params: { lat: center.lat, lng: center.lng, radiusKm } },
      );
      return response.data.data!;
    },
    // GBIF changes slowly and the backend caches for an hour
    staleTime: 10 * 60 * 1000,
    // keep the old observations on screen while a new area loads
    placeholderData: (previous) => previous,
  });
}
