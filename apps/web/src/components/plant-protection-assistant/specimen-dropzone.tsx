import { useId, useRef } from "react";
import { CloudUpload, Trash2 } from "lucide-react";
import { Button } from "@components/ui/button";

interface SpecimenDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
}

const MAX_SIZE_MB = 25;

export default function SpecimenDropzone({
  file,
  previewUrl,
  onChange,
}: SpecimenDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (candidate?: File) => {
    if (candidate?.type.startsWith("image/")) onChange(candidate);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          accept(e.dataTransfer.files[0]);
        }}
        className="group flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border bg-stitch-surface-container-lowest/60 p-5 text-center transition-colors hover:border-primary/60 has-[:focus-visible]:border-primary"
      >
        <span className="mb-2 flex size-10 items-center justify-center rounded-full border border-border/50 bg-muted text-primary transition-transform group-hover:scale-105">
          <CloudUpload className="size-5" />
        </span>
        <span className="font-stitch-body text-stitch-body-sm font-medium text-foreground">
          Drag & drop or click to upload a plant, leaf, bark or insect photo
        </span>
        <span className="mt-1 font-stitch-label text-stitch-label-sm text-muted-foreground">
          JPG, PNG, HEIC up to {MAX_SIZE_MB}MB
        </span>
      </label>

      {file && previewUrl && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted p-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={previewUrl}
              alt="Uploaded specimen preview"
              className="size-12 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-stitch-label text-stitch-label-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="font-stitch-label text-[10px] text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove specimen"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}
