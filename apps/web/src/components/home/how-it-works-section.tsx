import {
  Brain,
  Bug,
  Library,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

const STEPS: Step[] = [
  {
    icon: Brain,
    title: "Bitki Türünü Öğrenir",
    description:
      "Türün Latince taksonomisini ve morfolojik özelliklerini belirler.",
    tag: "Girdi Çözümleme",
  },
  {
    icon: MapPinned,
    title: "Konumu Değerlendirir",
    description:
      "Bölgesel iklim, mikroklima ve yerel istilacı göç haritalarını inceler.",
    tag: "Coğrafi Vektörler",
  },
  {
    icon: Bug,
    title: "İstilacı Türleri Bilgi Tabanından Getirir",
    description:
      "EPPO, Tarım Bakanlığı ve akademik veri tabanlarından güncel zararlıları çeker.",
    tag: "Semantik Arama",
  },
  {
    icon: ShieldCheck,
    title: "Koruyucu Önlemleri Araştırır",
    description:
      "Çevre dostu, biyolojik ve entegre zararlı yönetimi (IPM) metotlarını tarar.",
    tag: "Protokol Filtreleme",
  },
  {
    icon: Library,
    title: "Kaynak Göstererek Yanıtlar",
    description:
      "Hakemli makaleler ve resmi kılavuzlarla atıf yaparak güvenilir rapor sunar.",
    tag: "Kaynak Doğrulaması",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="nasil-calisir"
      className="w-full border-y border-border/30 bg-stitch-surface-container-low/70 py-20"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-stitch-secondary">
            Metodoloji & Algoritma
          </span>
          <h2 className="mt-2 font-stitch-headline text-stitch-headline-lg-mobile text-primary md:text-stitch-headline-lg">
            Nasıl Çalışır?
          </h2>
          <p className="mt-3 font-stitch-body text-stitch-body-lg text-muted-foreground">
            Sorunuzdan doğrulanmış akademik yanıta 5 adımlı bilimsel RAG
            süreci.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex flex-col justify-between rounded-xl border border-border/40 bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-stitch-secondary-container px-2.5 py-1 font-stitch-label text-stitch-label-sm font-bold text-stitch-on-secondary-container">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-stitch-body text-stitch-title-md text-primary">
                  {step.title}
                </h3>
                <p className="font-stitch-body text-stitch-body-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              <div className="mt-4 border-t border-border/50 pt-3">
                <span className="font-stitch-label text-stitch-label-sm text-stitch-outline">
                  {step.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
