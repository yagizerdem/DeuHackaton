import { BookOpen, Search, Sprout } from "lucide-react";
import { Button } from "@components/ui/button";

const QUICK_CATEGORIES = [
  "🌱 Balkon / Saksı Bitkileri",
  "🌳 Kent Ağaçları",
  "🌾 Bahçe & Meyvelik",
];

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-20 md:px-12">
      <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-stitch-primary-container p-8 text-stitch-on-primary-container md:p-14">
        <Sprout
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-10 size-72 opacity-10"
        />
        <div className="relative z-10 max-w-3xl">
          <span className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-stitch-secondary-fixed">
            Erken Teşhis Hayat Kurtarır
          </span>
          <h2 className="mt-3 mb-4 font-stitch-headline text-stitch-headline-lg-mobile leading-tight font-medium text-stitch-primary-fixed md:text-stitch-headline-xl">
            Ağacınızı veya Bitkinizi Bugün Bilimsel Olarak Koruyun
          </h2>
          <p className="mb-8 font-stitch-body text-stitch-body-lg leading-relaxed">
            Türünü ve bulunduğunuz konumu yazarak ilk sorunuzu hemen sorun,
            uzman onaylı bilgiye saniyeler içinde ulaşın.
          </p>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Button size="lg" className="h-11 px-6 font-stitch-body">
              <Search />
              İlk Sorunuzu Sorun
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 bg-transparent px-6 font-stitch-body"
            >
              <BookOpen />
              Literatür Veri Tabanını İncele
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-stitch-label text-stitch-label-sm">
              Hızlı arama kategorileri:
            </span>
            {QUICK_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className="cursor-pointer rounded-full bg-white/10 px-3 py-1 font-stitch-body text-xs transition-colors hover:bg-white/20"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
