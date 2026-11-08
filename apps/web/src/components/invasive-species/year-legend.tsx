import { rampGradient, type YearRange } from "@/lib/year-color";

interface YearLegendProps {
  yearRange: YearRange | null;
}

export default function YearLegend({ yearRange }: YearLegendProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
        Observation year
      </p>
      <div
        className="h-2.5 w-full rounded-full"
        style={{ background: rampGradient }}
        role="img"
        aria-label="Color scale from the oldest to the newest observation year"
      />
      <div className="flex justify-between font-stitch-label text-stitch-label-sm text-muted-foreground">
        <span>{yearRange?.min ?? "older"}</span>
        <span>{yearRange?.max ?? "newer"}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Higher and warmer points are more recent. The dome marks the analysis
        radius.
      </p>
    </div>
  );
}
