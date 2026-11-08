import { X } from "lucide-react";
import type { InvasiveObservationDto } from "@DeparkHackaton/dto";
import { Button } from "@components/ui/button";

interface ObservationDetailProps {
  observation: InvasiveObservationDto;
  onClose: () => void;
}

export default function ObservationDetail({
  observation,
  onClose,
}: ObservationDetailProps) {
  return (
    <div className="space-y-1 rounded-lg border border-border/50 bg-card/95 p-3 text-sm shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <em className="font-stitch-headline text-stitch-body-lg text-foreground">
          {observation.species}
        </em>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Kapat"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <p className="text-muted-foreground">
        {observation.year} yılında gözlendi, seçili konuma {observation.distanceKm} km
        uzaklıkta.
      </p>
      <p className="font-stitch-label text-xs text-muted-foreground">
        {observation.lat.toFixed(4)}, {observation.lng.toFixed(4)}
      </p>
      <a
        href={`https://www.gbif.org/occurrence/${observation.id}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-primary hover:underline"
      >
        GBIF'te aç
      </a>
    </div>
  );
}
