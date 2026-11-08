import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import type { PlantDto } from "@DeparkHackaton/dto";
import { Button } from "@components/ui/button";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { Skeleton } from "@components/ui/skeleton";
import FarmShell from "@components/farm/farm-shell";
import PlantCard from "@components/farm/plant-card";
import PlantFormDialog from "@components/farm/plant-form-dialog";
import { useDeletePlant, useParcels, usePlants } from "@/lib/farm-api";

export default function PlantsPage() {
  // "new" opens the empty form, a plant opens it for editing
  const [editor, setEditor] = useState<PlantDto | "new" | null>(null);
  const [params, setParams] = useSearchParams();
  const plants = usePlants();
  const parcels = useParcels();
  const deletePlant = useDeletePlant();

  const parcelFilter = params.get("parcelId") ?? "";
  const parcelById = new Map(parcels.data?.map((p) => [p.id, p]));
  const visible = plants.data?.filter(
    (plant) => !parcelFilter || plant.parcelId === parcelFilter,
  );

  return (
    <FarmShell
      title="My plants"
      actions={
        <div className="flex items-center gap-2">
          {!!parcels.data?.length && (
            <NativeSelect
              aria-label="Filter by parcel"
              value={parcelFilter}
              onChange={(e) =>
                setParams(e.target.value ? { parcelId: e.target.value } : {})
              }
            >
              <NativeSelectOption value="">All parcels</NativeSelectOption>
              {parcels.data.map((parcel) => (
                <NativeSelectOption key={parcel.id} value={parcel.id}>
                  {parcel.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
          <Button onClick={() => setEditor("new")}>
            <Plus />
            Add plant
          </Button>
        </div>
      }
    >
      {plants.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : plants.isError ? (
        <p className="text-sm text-destructive">Could not load your plants.</p>
      ) : visible?.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {parcelFilter
            ? "No plants in this parcel yet."
            : "You have no plants yet. Add your first one."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible?.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              parcel={plant.parcelId ? parcelById.get(plant.parcelId) : undefined}
              onEdit={() => setEditor(plant)}
              onDelete={() => deletePlant.mutate(plant.id)}
            />
          ))}
        </div>
      )}

      {editor && (
        <PlantFormDialog
          open
          onOpenChange={(open) => !open && setEditor(null)}
          plant={editor === "new" ? undefined : editor}
          parcels={parcels.data ?? []}
        />
      )}
    </FarmShell>
  );
}
