import { useState } from "react";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  title: string;
  count: number;
  /** called with the id of the card that was dropped here */
  onDropTask: (id: string) => void;
  children: React.ReactNode;
}

export default function BoardColumn({ title, count, onDropTask, children }: BoardColumnProps) {
  const [over, setOver] = useState(false);

  return (
    <section
      aria-label={`${title}, ${count} görev`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      // leaving for a child element also fires dragleave, ignore that
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDropTask(id);
      }}
      className={cn(
        "flex min-h-64 flex-col rounded-xl border border-border/60 bg-muted/30 p-3 transition-colors",
        over && "border-primary bg-primary/5",
      )}
    >
      <h2 className="flex items-center justify-between font-stitch-headline text-stitch-headline-sm text-foreground">
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 font-stitch-label text-xs text-muted-foreground">
          {count}
        </span>
      </h2>
      <ul className="mt-3 flex flex-1 flex-col gap-2">{children}</ul>
      {count === 0 && (
        <p className="mt-3 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Buraya sürükle
        </p>
      )}
    </section>
  );
}
