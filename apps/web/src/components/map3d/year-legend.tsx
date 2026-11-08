import { rampGradient, type YearRange } from "@/lib/year-color";

interface YearLegendProps {
  yearRange: YearRange | null;
}

export default function YearLegend({ yearRange }: YearLegendProps) {
  return (
    <div className="space-y-1.5">
      <p className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
        Gözlem yılı
      </p>
      <div
        className="h-2.5 w-full rounded-full"
        style={{ background: rampGradient }}
        role="img"
        aria-label="En eski gözlem yılından en yeniye renk ölçeği"
      />
      <div className="flex justify-between font-stitch-label text-stitch-label-sm text-muted-foreground">
        <span>{yearRange?.min ?? "eski"}</span>
        <span>{yearRange?.max ?? "yeni"}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Daha yüksek ve sıcak renkli noktalar daha yeni gözlemlerdir. Kubbe analiz
        yarıçapını gösterir.
      </p>
    </div>
  );
}
