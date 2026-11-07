import { Sprout } from "lucide-react";

const FOOTER_LINKS = [
  { href: "#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#", label: "EPPO Standartları" },
  { href: "#", label: "Akademik Kaynakça" },
  { href: "#", label: "Gizlilik Politikası" },
  { href: "#", label: "İletişim" },
];

export default function SiteFooter() {
  return (
    <footer
      id="kaynaklar"
      className="flex w-full flex-col items-center justify-between gap-6 border-t border-border/30 bg-stitch-surface-container-low px-6 py-10 md:flex-row md:px-12"
    >
      <div className="flex flex-col items-center gap-2 md:items-start">
        <div className="flex items-center gap-2">
          <Sprout className="size-5 text-primary" />
          <span className="font-stitch-headline text-stitch-headline-sm italic text-primary">
            Bitki Koruma Asistanı
          </span>
        </div>
        <p className="text-center font-stitch-body text-stitch-body-sm text-muted-foreground md:text-left">
          © 2024 Bitki Koruma Asistanı — Bitki Patolojisi ve RAG Destekli
          Bilimsel Araştırma Konsorsiyumu. Tüm hakları saklıdır.
        </p>
        <p className="mt-1 max-w-2xl text-center font-stitch-label text-stitch-label-sm text-stitch-outline md:text-left">
          Verilen bilgiler bilimsel literatüre dayanmakta olup acil zirai
          karantina vakalarında İl/İlçe Tarım Müdürlükleri ile irtibata
          geçilmelidir.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-stitch-label text-stitch-label-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
