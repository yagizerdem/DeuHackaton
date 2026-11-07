import {
  BookOpenText,
  CircleCheck,
  Database,
  Leaf,
  Navigation,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
}

const FEATURES: Feature[] = [
  {
    icon: BookOpenText,
    title: "Kaynak Gösteren Yanıtlar",
    description:
      "Her öneri doğrulanabilir bilimsel yayınlara, EPPO verilerine ve tarımsal kaynaklara doğrudan atıfta bulunur. Yanıltıcı veya uydurma (hallucination) tavsiyelere sıfır tolerans tanınır.",
    highlight: "DOI ve Resmi Veri Tabanı Bağlantıları",
  },
  {
    icon: Navigation,
    title: "Konuma Özel Öneriler",
    description:
      "İlçe ve mikroklima bazlı verilerle bölgenizdeki aktif istilacı tür baskısını ve karantina bölgelerini hesaplar. Doğu Karadeniz ile Ege kıyısındaki koruma stratejilerini birbirinden net olarak ayırır.",
    highlight: "Bölgesel İklim ve Karantina Haritası",
  },
  {
    icon: Database,
    title: "Güncel İstilacı Tür Bilgi Tabanı",
    description:
      "Yeni tespit edilen istilacı böcek, mantar ve yabancı ot kayıtları anlık olarak vektör veri tabanına işlenir. Sınır aşan zararlı hareketleri ve alarm seviyeleri haftalık güncellenir.",
    highlight: "Haftalık Senkronize Vektör Havuzu",
  },
  {
    icon: Leaf,
    title: "Pratik Koruma Adımları",
    description:
      "Kimyasal yükü en aza indiren biyolojik kontrol, tuzaklama ve kültürel bakım yönergeleri sağlar. Bahçeniz ve kentsel yeşil doku için doğa dostu Entegre Zararlı Yönetimi (IPM) sunar.",
    highlight: "Sürdürülebilir IPM Metodolojisi",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="ozellikler"
      className="mx-auto max-w-[1440px] px-5 py-20 md:px-12"
    >
      <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-stitch-secondary">
            Yetkinlikler
          </span>
          <h2 className="mt-2 font-stitch-headline text-stitch-headline-lg-mobile text-primary md:text-stitch-headline-lg">
            Bilimsel Standartlarda Bitki Sağlığı
          </h2>
        </div>
        <p className="max-w-md font-stitch-body text-stitch-body-md text-muted-foreground">
          Geleneksel arama motorlarının ötesinde, her çıktıyı kanıtlanabilir
          bilimsel yayın temeline bağlayan yeni nesil analiz mimarisi.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group flex flex-col justify-between rounded-xl border border-border/40 bg-card p-8 transition-all hover:border-stitch-secondary/50"
          >
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-stitch-surface-container-low text-primary transition-colors group-hover:bg-stitch-primary-container group-hover:text-stitch-on-primary-container">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-3 font-stitch-headline text-stitch-headline-md text-primary">
                {feature.title}
              </h3>
              <p className="font-stitch-body text-stitch-body-lg leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-4">
              <CircleCheck className="size-4 text-stitch-secondary" />
              <span className="font-stitch-label text-stitch-label-sm text-muted-foreground">
                {feature.highlight}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
