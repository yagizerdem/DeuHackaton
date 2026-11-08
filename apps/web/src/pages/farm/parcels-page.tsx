import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus } from "lucide-react";
import type { ParcelDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import ConfirmDelete from "@components/farm/confirm-delete";
import FarmShell from "@components/farm/farm-shell";
import ParcelFormDialog from "@components/farm/parcel-form-dialog";
import ParcelMap from "@components/farm/parcel-map";
import { useDeleteParcel, useParcels } from "@/lib/farm-api";
import { formatArea, polygonAreaHa } from "@/lib/geo";
import { cn } from "@/lib/utils";

export default function ParcelsPage() {
  // "new" opens the empty form, a parcel opens it for editing
  const [editor, setEditor] = useState<ParcelDto | "new" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const parcels = useParcels();
  const deleteParcel = useDeleteParcel();

  return (
    <FarmShell
      title="My parcels"
      actions={
        <Button onClick={() => setEditor("new")}>
          <Plus />
          Add parcel
        </Button>
      }
    >
      {parcels.isPending ? (
        <Skeleton className="h-96" />
      ) : parcels.isError ? (
        <p className="text-sm text-destructive">Could not load your parcels.</p>
      ) : parcels.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No parcels yet. Draw your first field or garden on the map.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <ul className="space-y-3 lg:col-span-5">
            {parcels.data.map((parcel) => (
              <li
                key={parcel.id}
                className={cn(
                  "space-y-2 rounded-xl border bg-card p-4 transition-colors",
                  parcel.id === selectedId
                    ? "border-primary"
                    : "border-border/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(parcel.id)}
                    className="cursor-pointer text-left"
                  >
                    <h2 className="font-stitch-headline text-stitch-headline-sm text-foreground">
                      {parcel.name}
                    </h2>
                    <p className="font-stitch-label text-stitch-label-sm text-muted-foreground">
                      {formatArea(polygonAreaHa(parcel.polygon))}
                    </p>
                  </button>
                  <Badge variant="secondary">
                    {parcel.kind === "garden" ? "Garden" : "Field"}
                  </Badge>
                </div>
                {parcel.notes && (
                  <p className="text-sm text-muted-foreground">{parcel.notes}</p>
                )}
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <Link
                    to={`/plants?parcelId=${parcel.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {parcel.plantCount}{" "}
                    {parcel.plantCount === 1 ? "plant" : "plants"}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditor(parcel)}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <ConfirmDelete
                      name={parcel.name}
                      description="Its plants and tasks are kept, they just lose the parcel link."
                      onConfirm={() => deleteParcel.mutate(parcel.id)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="h-96 lg:col-span-7 lg:h-[32rem]">
            <ParcelMap
              parcels={parcels.data}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      )}

      {editor && (
        <ParcelFormDialog
          open
          onOpenChange={(open) => !open && setEditor(null)}
          parcel={editor === "new" ? undefined : editor}
        />
      )}
    </FarmShell>
  );
}
