import { useRef, useState } from "react";
import { Input } from "@components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  value: string;
  /** called with the trimmed text, only when it changed */
  onSave: (value: string) => void;
  /** names the field for screen readers */
  label: string;
  placeholder?: string;
  /** an empty value is dropped instead of saved */
  required?: boolean;
  className?: string;
}

/** Text that turns into an input on double click (or Enter / F2 when focused). */
export default function InlineEditCell({
  value,
  onSave,
  label,
  placeholder = "—",
  required,
  className,
}: InlineEditCellProps) {
  const [draft, setDraft] = useState<string | null>(null);
  // Enter and the blur it causes would otherwise finish the edit twice
  const finished = useRef(false);

  function start() {
    finished.current = false;
    setDraft(value);
  }

  function finish(save: boolean) {
    if (finished.current || draft === null) return;
    finished.current = true;
    const next = draft.trim();
    setDraft(null);
    if (save && next !== value && !(required && next === "")) onSave(next);
  }

  if (draft !== null) {
    return (
      <Input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") finish(true);
          if (e.key === "Escape") finish(false);
        }}
        className="h-8"
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${value || "boş"}. Düzenlemek için çift tıkla veya Enter'a bas`}
      title="Düzenlemek için çift tıkla"
      onDoubleClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "F2") {
          e.preventDefault();
          start();
        }
      }}
      className={cn(
        "block cursor-text rounded px-1 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !value && "text-muted-foreground",
        className,
      )}
    >
      {value || placeholder}
    </span>
  );
}
