import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";

const MAX_TAGS = 10;

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export default function TagEditor({ tags, onChange, disabled }: TagEditorProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const tag = draft.trim().slice(0, 30);
    setDraft("");
    if (tag && !tags.includes(tag) && tags.length < MAX_TAGS) {
      onChange([...tags, tag]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            disabled={disabled}
            aria-label={`Remove tag ${tag}`}
            className="cursor-pointer rounded-full hover:text-destructive"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {tags.length < MAX_TAGS && (
        <Input
          value={draft}
          disabled={disabled}
          placeholder="Add tag"
          aria-label="Add tag"
          maxLength={30}
          className="h-6 w-24 px-2 text-xs"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={addTag}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
      )}
    </div>
  );
}
