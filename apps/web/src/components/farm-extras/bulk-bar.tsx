import { useId, useState } from "react";
import { Tag, Trash2, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

interface BulkBarProps {
  count: number;
  /** tags already in use, offered while typing */
  knownTags: string[];
  busy?: boolean;
  onTag: (tag: string, mode: "add" | "remove") => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floats above the list while rows are selected. */
export default function BulkBar({
  count,
  knownTags,
  busy,
  onTag,
  onDelete,
  onClear,
}: BulkBarProps) {
  const [tag, setTag] = useState("");
  const listId = useId();

  function apply(mode: "add" | "remove") {
    const value = tag.trim();
    if (!value) return;
    onTag(value, mode);
    setTag("");
  }

  return (
    <section
      aria-label="Toplu işlemler"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl border border-border bg-popover p-3 shadow-lg"
    >
      <span className="mr-auto font-stitch-body text-sm font-medium" aria-live="polite">
        {count} bitki seçildi
      </span>

      <Tag className="size-4 text-muted-foreground" aria-hidden />
      <Input
        value={tag}
        list={listId}
        maxLength={30}
        placeholder="Etiket"
        aria-label="Etiket"
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply("add")}
        className="h-8 w-36"
      />
      <datalist id={listId}>
        {knownTags.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <Button size="sm" variant="outline" disabled={busy || !tag.trim()} onClick={() => apply("add")}>
        Ekle
      </Button>
      <Button size="sm" variant="outline" disabled={busy || !tag.trim()} onClick={() => apply("remove")}>
        Çıkar
      </Button>

      <Button size="sm" variant="destructive" disabled={busy} onClick={onDelete}>
        <Trash2 />
        Sil
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Seçimi temizle" onClick={onClear}>
        <X />
      </Button>
    </section>
  );
}
