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
    title: "EPPO Küresel Veri Tabanı (2023) —",
    quote: "“Anoplophora chinensis Karantina Raporu”",
    meta: "EPPO Data Sheets on Quarantine Pests • Kod: ANOLCN",
  },
  {
    id: "ref-2",
    title: "Orman Genel Müdürlüğü & TÜBİTAK (2022) —",
    quote: "“Marmara Bölgesi Kent Ormanı Zararlıları”",
    meta: "Proje No: 118O429 • ISBN: 978-605-7599-12-8",
  },
  {
    id: "ref-3",
    title: "Bitki Koruma Bülteni, Cilt 61 —",
    quote: "“Platanus Türlerinde Biyolojik Mücadele Esasları”",
    meta: "DOI: 10.16955/bitkorb.892110 • Hakemli Yayın",
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
              Bitki Koruma Asistanı Yanıtı
            </h3>
            <p className="font-stitch-label text-stitch-label-sm text-stitch-outline">
              Sentezlenen Vektör Analizi • Az önce güncellendi
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-stitch-secondary/20 bg-stitch-secondary-container px-2.5 py-1 font-stitch-label text-stitch-label-md font-semibold text-stitch-on-secondary-container">
          <BadgeCheck className="size-4" />
          Doğrulanmış Literatür
        </span>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border/30 bg-stitch-surface-container-low px-3 py-1.5">
        <TreeDeciduous className="size-4 text-primary" />
        <span className="font-stitch-headline text-stitch-body-md font-medium italic text-primary">
          Platanus orientalis (Doğu Çınarı)
        </span>
        <span className="text-stitch-outline">•</span>
        <span className="font-stitch-label text-stitch-label-sm font-semibold text-muted-foreground">
          İstanbul / Marmara Havzası
        </span>
      </div>

      <p className="mt-4 pt-2 font-stitch-body text-stitch-body-lg leading-relaxed text-foreground">
        İstanbul şartlarında Doğu Çınarı (<em>Platanus orientalis</em>) için en
        kritik biyolojik tehdit <strong>Anoplophora chinensis</strong>{" "}
        (Turunçgil Uzunantenli Böceği)
        <CitationBadge index={1} href="#ref-1" /> ve{" "}
        <strong>Corythucha ciliata</strong> (Çınar Dantel Böceği)
        <CitationBadge index={2} href="#ref-2" /> türleridir. Erken dönemde
        gövdede talaş çıkışı ve yaprak sararmaları düzenli taranmalı, feromon
        tuzakları ve biyolojik mücadele protokolleri uygulanmalıdır
        <CitationBadge index={3} href="#ref-3" />.
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-l-4 border-border/30 border-l-stitch-on-tertiary-container bg-background p-4">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-stitch-on-tertiary-container" />
        <div>
          <h4 className="font-stitch-body text-stitch-title-md text-primary">
            Karantina Uyarısı (EPPO A2 Listesi)
          </h4>
          <p className="mt-0.5 font-stitch-body text-stitch-body-sm text-muted-foreground">
            <em>Anoplophora chinensis</em> tespit edilmesi halinde derhal yerel
            bitki sağlığı müdürlüğüne bildirim yapılması yasal zorunluluktur.
            Gövde dip kısımlarında 10-15 mm çapında çıkış delikleri
            taranmalıdır.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-border/50 pt-5">
        <h4 className="mb-3 flex items-center gap-1.5 font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="size-4 text-stitch-secondary" />
          Doğrulanmış Akademik ve İdari Kaynakça
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
                İncele
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
            Güvenilirlik Skoru:{" "}
            <strong className="font-bold text-primary">%98.4</strong>
          </span>
          <span className="flex items-center gap-1.5 font-stitch-label text-stitch-label-sm text-muted-foreground">
            <Database className="size-3 text-stitch-secondary" />
            RAG Vektör Veritabanı:{" "}
            <strong className="font-bold text-primary">Güncel</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="Raporu Kopyala">
            <Copy />
          </Button>
          <Button variant="ghost" size="icon-sm" title="PDF Olarak Aktar">
            <Download />
          </Button>
        </div>
      </div>
    </div>
  );
}
