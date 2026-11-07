import type {
  PlantAnalysisResult,
  PlantKnowledgeSource,
} from "@/lib/plant-analysis";

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-stitch-headline text-foreground">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

interface AnalysisResultProps {
  result: PlantAnalysisResult;
  /** names the box when several results are shown together */
  title?: string;
  /** knowledge base pages the assessment was grounded in */
  sources?: PlantKnowledgeSource[];
}

export default function AnalysisResult({
  result: { analysis, assessment },
  title,
  sources,
}: AnalysisResultProps) {
  if (!analysis.isPlant) {
    return (
      <p className="rounded-xl border border-border/60 p-5 text-sm text-muted-foreground">
        {title && <strong className="mr-1 text-foreground">{title}:</strong>}
        No plant was detected in this image.
      </p>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-stitch-surface-container-low p-5">
      <header className="space-y-1">
        {title && (
          <p className="font-stitch-label text-stitch-label-sm uppercase tracking-wider text-primary">
            {title}
          </p>
        )}
        <h2 className="font-stitch-headline text-xl text-foreground">
          {analysis.species.commonName}{" "}
          <span className="text-sm italic text-muted-foreground">
            {analysis.species.latinName}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        <p className="text-sm text-foreground">
          Severity: <strong>{assessment.severity}</strong> · Urgency:{" "}
          <strong>{assessment.urgency.replace("_", " ")}</strong>
        </p>
      </header>
      <Section title="Symptoms" items={analysis.symptoms} />
      <Section
        title="Suspected pests and diseases"
        items={analysis.suspectedPestsAndDiseases.map(
          (p) => `${p.commonName} (${p.latinName}): ${p.reason}`,
        )}
      />
      <Section
        title="Treatment plan"
        items={assessment.treatmentPlan.map((s) => `${s.step} — ${s.timing}`)}
      />
      <Section title="Monitoring" items={assessment.monitoring} />
      <p className="text-sm text-muted-foreground">{assessment.rationale}</p>
      {sources && sources.length > 0 && (
        <section className="space-y-2 border-t border-border/40 pt-4">
          <h3 className="font-stitch-headline text-foreground">
            Knowledge base sources
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {sources.map(({ source, page, score }) => (
              <li
                key={`${source}-${page}`}
                className="flex justify-between gap-3"
              >
                <span className="truncate">
                  {source} · p.{page}
                </span>
                <span className="shrink-0 font-stitch-label">
                  {Math.round(score * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {assessment.reportToAuthorities && (
        <p role="alert" className="text-sm font-medium text-destructive">
          Report this finding to the plant protection authorities.
        </p>
      )}
    </div>
  );
}
