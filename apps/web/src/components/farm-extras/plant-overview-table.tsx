import { Pencil, Sprout, Trash2 } from "lucide-react";
import type { PlantOverviewDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import InlineEditCell from "@components/farm-extras/inline-edit-cell";
import PlantStatusBadge from "@components/farm-extras/plant-status-badge";
import { formatDate } from "@components/farm-extras/format";
import { photoUrl } from "@/lib/farm-api";

interface PlantOverviewTableProps {
  plants: PlantOverviewDto[];
  parcelNames: ReadonlyMap<string, string>;
  selected: ReadonlySet<string>;
  onToggle: (id: string, selected: boolean) => void;
  onToggleAll: (selected: boolean) => void;
  onRename: (id: string, patch: { name?: string; latinName?: string; careNote?: string }) => void;
  onEdit: (plant: PlantOverviewDto) => void;
  onDelete: (plant: PlantOverviewDto) => void;
}

export default function PlantOverviewTable({
  plants,
  parcelNames,
  selected,
  onToggle,
  onToggleAll,
  onRename,
  onEdit,
  onDelete,
}: PlantOverviewTableProps) {
  const selectedCount = plants.filter((p) => selected.has(p.id)).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Ad, tür ve bakım notunu düzenlemek için hücreye çift tıkla.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedCount === plants.length}
                  indeterminate={selectedCount > 0 && selectedCount < plants.length}
                  onCheckedChange={onToggleAll}
                  aria-label="Tümünü seç"
                />
              </TableHead>
              <TableHead>Bitki</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Parsel</TableHead>
              <TableHead>Etiketler</TableHead>
              <TableHead className="text-right">Açık görev</TableHead>
              <TableHead>Son analiz</TableHead>
              <TableHead>Bakım notu</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.map((plant) => {
              const photo = photoUrl(plant);
              return (
                <TableRow key={plant.id} data-state={selected.has(plant.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(plant.id)}
                      onCheckedChange={(checked) => onToggle(plant.id, checked)}
                      aria-label={`${plant.name} seç`}
                    />
                  </TableCell>
                  <TableCell className="min-w-44">
                    <div className="flex items-center gap-2">
                      {photo ? (
                        <img src={photo} alt="" loading="lazy" className="size-8 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
                          <Sprout className="size-4 text-muted-foreground/60" aria-hidden />
                        </span>
                      )}
                      <InlineEditCell
                        label="Bitki adı"
                        value={plant.name}
                        required
                        onSave={(name) => onRename(plant.id, { name })}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-40 italic">
                    <InlineEditCell
                      label="Tür"
                      value={plant.latinName ?? ""}
                      onSave={(latinName) => onRename(plant.id, { latinName })}
                    />
                  </TableCell>
                  <TableCell>
                    <PlantStatusBadge status={plant.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(plant.parcelId && parcelNames.get(plant.parcelId)) || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plant.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{plant.openTasks}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {plant.lastAnalysis ? formatDate(plant.lastAnalysis.createdAt) : "—"}
                  </TableCell>
                  <TableCell className="min-w-48 text-muted-foreground">
                    <InlineEditCell
                      label="Bakım notu"
                      value={plant.careNote ?? ""}
                      onSave={(careNote) => onRename(plant.id, { careNote })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="icon-sm" variant="ghost" aria-label={`${plant.name} düzenle`} onClick={() => onEdit(plant)}>
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive"
                        aria-label={`${plant.name} sil`}
                        onClick={() => onDelete(plant)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
