import { ArrowRight, ImagePlus, Leaf, LocateFixed, MapPin } from "lucide-react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";

const EXAMPLE_QUESTIONS = [
  "Zeytin ağacı dal kanseri",
  "Ankara karaçam çam kese böceği",
  "Turunçgil unlu biti",
];

export default function QueryPanel() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 text-stitch-secondary" />
          <span className="font-stitch-label text-stitch-label-sm">
            İstanbul, Türkiye
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-stitch-surface-container-low px-2.5 py-0.5">
          <Leaf className="size-3 text-stitch-secondary" />
          <span className="font-stitch-label text-stitch-label-sm font-medium text-stitch-secondary">
            Platanus orientalis
          </span>
        </div>
      </div>
      <Textarea
        rows={3}
        className="resize-none font-stitch-body text-stitch-body-md"
        placeholder="Ağacınızın veya bitkinizin durumunu yazın..."
        defaultValue="İstanbul'da çınar ağacım var. Hangi istilacı türlere karşı önlem almalıyım?"
      />
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Numune Görseli Ekle">
            <ImagePlus />
          </Button>
          <Button variant="ghost" size="icon" title="Konum Değiştir">
            <LocateFixed />
          </Button>
        </div>
        <Button size="lg" className="font-stitch-body">
          Sor
          <ArrowRight />
        </Button>
      </div>
      <div className="border-t border-border/50 pt-3">
        <p className="mb-2 font-stitch-label text-stitch-label-sm text-stitch-outline">
          Örnek sorular:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              className="cursor-pointer rounded border border-border/20 bg-stitch-surface-container-low px-2 py-1 font-stitch-body text-stitch-body-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
