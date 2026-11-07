import QueryPanel from "@components/home/query-panel";
import AnswerPreview from "@components/home/answer-preview";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-12 pb-20 md:px-12">
      <div className="mb-6 flex items-center justify-start">
        <div className="inline-flex items-center gap-2 rounded-full border border-stitch-secondary/20 bg-stitch-secondary-container px-3.5 py-1.5">
          <span className="size-2 animate-pulse rounded-full bg-stitch-secondary" />
          <span className="font-stitch-label text-stitch-label-md font-semibold text-stitch-on-secondary-container">
            🌱 RAG Destekli Bilimsel Bitki Patolojisi Asistanı
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h1 className="font-stitch-headline text-stitch-headline-xl-mobile font-medium tracking-tight text-primary md:text-stitch-headline-xl">
            Ağaçlarınızı ve Bitkilerinizi İstilacı Türlerden Bilimsel
            Kaynaklarla Koruyun
          </h1>
          <p className="font-stitch-body text-stitch-body-lg text-muted-foreground">
            Türkiye ve Akdeniz ekosistemine özel, hakemli akademik
            araştırmalar ve tarımsal veri tabanlarıyla doğrulanmış yapay zekâ
            rehberliği.
          </p>
          <QueryPanel />
        </div>
        <div className="lg:col-span-7">
          <AnswerPreview />
        </div>
      </div>
    </section>
  );
}
