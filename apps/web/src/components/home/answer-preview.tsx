import {
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Copy,
  Database,
  Download,
  ExternalLink,
  TreeDeciduous,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@components/ui/button";
import CitationBadge from "@components/home/citation-badge";

const REFERENCES = [
  {
    id: "ref-1",
    title: "EPPO Global Database (2023) —",
    quote: "“Anoplophora chinensis Quarantine Report”",
    meta: "EPPO Data Sheets on Quarantine Pests • Code: ANOLCN",
  },
  {
    id: "ref-2",
    title: "General Directorate of Forestry & TÜBİTAK (2022) —",
    quote: "“Pests of Urban Forests in the Marmara Region”",
    meta: "Project No: 118O429 • ISBN: 978-605-7599-12-8",
  },
  {
    id: "ref-3",
    title: "Plant Protection Bulletin, Vol. 61 —",
    quote: "“Principles of Biological Control in Platanus Species”",
    meta: "DOI: 10.16955/bitkorb.892110 • Peer-Reviewed Publication",
  },
];

export default function AnswerPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-stitch-primary-container text-stitch-on-primary-container">
            <BrainCircuit className="size-6" />
          </div>
          <div>
            <h3 className="font-stitch-body text-stitch-title-lg text-primary">
              Plant Protection Assistant Response
            </h3>
            <p className="font-stitch-label text-stitch-label-sm text-stitch-outline">
              Synthesized Vector Analysis • Updated just now
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-stitch-secondary/20 bg-stitch-secondary-container px-2.5 py-1 font-stitch-label text-stitch-label-md font-semibold text-stitch-on-secondary-container">
          <BadgeCheck className="size-4" />
          Verified Literature
        </span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border/30 bg-stitch-surface-container-low px-3 py-1.5">
        <TreeDeciduous className="size-4 text-primary" />
        <span className="font-stitch-headline text-stitch-body-md font-medium italic text-primary">
          Platanus orientalis (Oriental Plane)
        </span>
        <span className="text-stitch-outline">•</span>
        <span className="font-stitch-label text-stitch-label-sm font-semibold text-muted-foreground">
          Istanbul / Marmara Basin
        </span>
      </div>

      <p className="mt-4 pt-2 font-stitch-body text-stitch-body-lg leading-relaxed text-foreground">
        In Istanbul conditions, the most critical biological threats to the
        Oriental Plane (<em>Platanus orientalis</em>) are{" "}
        <strong>Anoplophora chinensis</strong> (Citrus Longhorned Beetle)
        <CitationBadge index={1} href="#ref-1" /> and{" "}
        <strong>Corythucha ciliata</strong> (Sycamore Lace Bug)
        <CitationBadge index={2} href="#ref-2" />. In the early stage, check the trunk regularly for sawdust and leaf
        yellowing, and apply pheromone traps and biological control protocols
        <CitationBadge index={3} href="#ref-3" />.
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-l-4 border-border/30 border-l-stitch-on-tertiary-container bg-background p-4">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-stitch-on-tertiary-container" />
        <div>
          <h4 className="font-stitch-body text-stitch-title-md text-primary">
            Quarantine Alert (EPPO A2 List)
          </h4>
          <p className="mt-0.5 font-stitch-body text-stitch-body-sm text-muted-foreground">
            <em>Anoplophora chinensis</em> is detected, reporting it to the local
            plant health directorate immediately is a legal requirement. Check
            the base of the trunk for exit holes 10-15 mm in diameter.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-border/50 pt-5">
        <h4 className="mb-3 flex items-center gap-1.5 font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="size-4 text-stitch-secondary" />
          Verified Academic and Administrative References
        </h4>
        <div className="flex flex-col gap-2.5">
          {REFERENCES.map((ref, i) => (
            <div
              key={ref.id}
              id={ref.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border/30 bg-background p-3 transition-colors hover:border-stitch-secondary"
            >
              <div className="flex items-start gap-3">
                <CitationBadge index={i + 1} />
                <div>
                  <p className="font-stitch-body text-stitch-body-md font-medium text-primary">
                    {ref.title}{" "}
                    <span className="font-stitch-headline italic">
                      {ref.quote}
                    </span>
                  </p>
                  <span className="font-stitch-label text-stitch-label-sm text-stitch-outline">
                    {ref.meta}
                  </span>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 font-stitch-label text-stitch-label-sm text-stitch-secondary transition-colors hover:text-primary">
                View
                <ExternalLink className="size-3" />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-stitch-label text-stitch-label-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-stitch-secondary" />
            Reliability Score:{" "}
            <strong className="font-bold text-primary">%98.4</strong>
          </span>
          <span className="flex items-center gap-1.5 font-stitch-label text-stitch-label-sm text-muted-foreground">
            <Database className="size-3 text-stitch-secondary" />
            RAG Vector Database:{" "}
            <strong className="font-bold text-primary">Up to date</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="Copy Report">
            <Copy />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Export as PDF">
            <Download />
          </Button>
        </div>
      </div>
    </div>
  );
}
