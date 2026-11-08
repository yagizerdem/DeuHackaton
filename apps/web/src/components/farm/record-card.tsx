import type { AnalysisRecordDto, PlantDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import ConfirmDelete from "@components/farm/confirm-delete";
import TagEditor from "@components/farm/tag-editor";
import type {
  PlantAnalysis,
  PlantRiskAssessment,
} from "@/lib/plant-analysis";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<PlantRiskAssessment["severity"], string> = {
  none: "bg-stitch-secondary-container text-stitch-on-secondary-container",
  low: "bg-stitch-secondary-container text-stitch-on-secondary-container",
  medium: "bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed-variant",
  high: "bg-stitch-tertiary-fixed-dim text-stitch-on-tertiary-fixed",
  critical: "bg-destructive text-white",
};

interface RecordCardProps {
  record: AnalysisRecordDto;
  plants: PlantDto[];
  busy?: boolean;
  onTagsChange: (tags: string[]) => void;
  onPlantChange: (plantId: string | null) => void;
  onDelete: () => void;
}

export default function RecordCard({
  record,
  plants,
  busy,
  onTagsChange,
  onPlantChange,
  onDelete,
}: RecordCardProps) {
  const analysis = record.analysis as unknown as PlantAnalysis;
  const assessment = record.assessment as unknown as PlantRiskAssessment;
  const title = analysis.isPlant
    ? analysis.species.commonName || analysis.species.latinName
    : "Not a plant";

  return (
    <article className="space-y-3 rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-stitch-headline text-stitch-headline-sm text-foreground">
            {title}
          </h2>
          {analysis.isPlant && analysis.species.latinName && (
            <p className="font-stitch-headline text-sm italic text-muted-foreground">
              {analysis.species.latinName}
            </p>
          )}
          <p className="font-stitch-label text-stitch-label-sm text-muted-foreground">
            {new Date(record.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn("capitalize", SEVERITY_STYLE[assessment.severity])}
          >
            {assessment.severity}
          </Badge>
          <Badge variant="outline">
            {record.mode === "rag" ? "Knowledge base" : "Standard"}
          </Badge>
          <ConfirmDelete name="this record" onConfirm={onDelete} disabled={busy} />
        </div>
      </div>

      {analysis.summary && (
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-primary">Details</summary>
        <div className="mt-2 space-y-3 text-muted-foreground">
          <p>
            <strong className="text-foreground">Urgency:</strong>{" "}
            {assessment.urgency.replaceAll("_", " ")}.{" "}
            {assessment.rationale}
          </p>
          {analysis.suspectedPestsAndDiseases.length > 0 && (
            <div>
              <strong className="text-foreground">Suspected causes</strong>
              <ul className="list-disc pl-5">
                {analysis.suspectedPestsAndDiseases.map((pest) => (
                  <li key={pest.latinName}>
                    <em>{pest.latinName}</em> ({pest.commonName}): {pest.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assessment.treatmentPlan.length > 0 && (
            <div>
              <strong className="text-foreground">Treatment plan</strong>
              <ol className="list-decimal pl-5">
                {assessment.treatmentPlan.map((item) => (
                  <li key={item.step}>
                    {item.step} <span className="italic">({item.timing})</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
        <TagEditor tags={record.tags} onChange={onTagsChange} disabled={busy} />
        <div className="flex items-center gap-2 text-sm">
          <NativeSelect
            aria-label="Linked plant"
            value={record.plantId ?? ""}
            disabled={busy}
            onChange={(e) => onPlantChange(e.target.value || null)}
          >
            <NativeSelectOption value="">No plant</NativeSelectOption>
            {plants.map((p) => (
              <NativeSelectOption key={p.id} value={p.id}>
                {p.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
    </article>
  );
}
