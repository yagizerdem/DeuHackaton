import { useEffect, useRef, useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@components/ui/button";
import SpecimenDropzone from "@components/plant-protection-assistant/specimen-dropzone";

interface AnalysisFormProps {
  isLoading: boolean;
  onSubmit: (image: File) => void;
}

export default function AnalysisForm({
  isLoading,
  onSubmit,
}: AnalysisFormProps) {
  const [selection, setSelection] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // the object URL is created and revoked in the change handler, not an effect
  const handleFileChange = (next: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = next ? URL.createObjectURL(next) : null;
    setSelection(
      next && previewUrlRef.current
        ? { file: next, previewUrl: previewUrlRef.current }
        : null,
    );
  };

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const file = selection?.file ?? null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (file) onSubmit(file);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border/60 bg-stitch-surface-container-low p-5"
    >
      <div className="border-b border-border/40 pb-3.5">
        <h2 className="font-stitch-body text-stitch-title-lg text-foreground">
          New Analysis
        </h2>
        <p className="mt-0.5 font-stitch-body text-stitch-body-sm text-muted-foreground">
          Upload a photo of your plant, leaf, bark or insect
        </p>
      </div>

      <SpecimenDropzone
        file={file}
        previewUrl={selection?.previewUrl ?? null}
        onChange={handleFileChange}
      />

      <Button
        type="submit"
        size="lg"
        disabled={!file || isLoading}
        className="h-10 w-full font-stitch-body cursor-pointer"
      >
        <Sparkles />
        {isLoading ? "Analyzing…" : "Analyze plant"}
      </Button>
    </form>
  );
}
