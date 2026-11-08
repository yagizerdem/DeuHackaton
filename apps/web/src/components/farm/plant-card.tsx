import { Link } from "react-router";
import { MapPin, Pencil, Sprout } from "lucide-react";
import type { ParcelDto, PlantDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import ConfirmDelete from "@components/farm/confirm-delete";
import { photoUrl } from "@/lib/farm-api";

interface PlantCardProps {
  plant: PlantDto;
  parcel?: ParcelDto;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PlantCard({
  plant,
  parcel,
  onEdit,
  onDelete,
}: PlantCardProps) {
  const photo = photoUrl(plant);

  return (
    <Card className="overflow-hidden pt-0">
      <div className="flex aspect-video items-center justify-center bg-stitch-surface-container-low">
        {photo ? (
          <img
            src={photo}
            alt={plant.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <Sprout className="size-10 text-muted-foreground/50" aria-hidden />
        )}
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

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {parcel && (
            <Badge variant="secondary" render={<Link to="/parcels" />}>
              {parcel.name}
            </Badge>
          )}
          {plant.location && (
            <span className="flex items-center gap-1 font-stitch-label">
              <MapPin className="size-3" aria-hidden />
              {plant.location.lat.toFixed(4)}, {plant.location.lng.toFixed(4)}
            </span>
          )}
        </div>

        {plant.careNote && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {plant.careNote}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 border-t border-border/40 pt-3">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <ConfirmDelete
            name={plant.name}
            description="Its tasks are deleted too. Saved analysis records stay, without the plant link."
            onConfirm={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
