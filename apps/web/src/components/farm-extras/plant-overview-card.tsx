import { CalendarClock, ListChecks, MapPin, Pencil, Sprout, Trash2 } from "lucide-react";
import type { PlantOverviewDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import PlantStatusBadge from "@components/farm-extras/plant-status-badge";
import { formatDate } from "@components/farm-extras/format";
import { photoUrl } from "@/lib/farm-api";
import { cn } from "@/lib/utils";

interface PlantOverviewCardProps {
  plant: PlantOverviewDto;
  parcelName?: string;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PlantOverviewCard({
  plant,
  parcelName,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: PlantOverviewCardProps) {
  const photo = photoUrl(plant);

  return (
    <Card className={cn("overflow-hidden pt-0 transition-shadow", selected && "ring-2 ring-primary")}>
      <div className="relative flex aspect-video items-center justify-center bg-stitch-surface-container-low">
        {photo ? (
          <img src={photo} alt={plant.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <Sprout className="size-10 text-muted-foreground/50" aria-hidden />
        )}
        <div className="absolute left-2 top-2 rounded bg-background/85 p-1.5">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            aria-label={`${plant.name} seç`}
          />
        </div>
        <PlantStatusBadge status={plant.status} className="absolute right-2 top-2 shadow-sm" />
      </div>

      <CardContent className="space-y-3">
        <div>
          <h2 className="font-stitch-headline text-stitch-headline-sm text-foreground">
            {plant.name}
          </h2>
          {plant.latinName && (
            <p className="font-stitch-headline text-sm italic text-muted-foreground">
              {plant.latinName}
            </p>
          )}
        </div>

        {(parcelName || plant.tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {parcelName && (
              <Badge variant="secondary">
                <MapPin aria-hidden />
                {parcelName}
              </Badge>
            )}
            {plant.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ListChecks className="size-3.5" aria-hidden />
            {plant.openTasks > 0 ? `${plant.openTasks} açık görev` : "Açık görev yok"}
          </span>
          {plant.lastAnalysis && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" aria-hidden />
              Analiz: {formatDate(plant.lastAnalysis.createdAt)}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil />
            Düzenle
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
            <Trash2 />
            Sil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
