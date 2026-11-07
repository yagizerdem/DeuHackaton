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
    title: "Cited Answers",
    description:
      "Every recommendation directly cites verifiable scientific publications, EPPO data and agricultural sources. Zero tolerance for misleading or fabricated (hallucinated) advice.",
    highlight: "DOI and Official Database Links",
  },
  {
    icon: Navigation,
    title: "Location-Specific Recommendations",
    description:
      "Uses district-level and microclimate data to calculate active invasive species pressure and quarantine zones in your area. Clearly separates protection strategies for the Eastern Black Sea from those for the Aegean coast.",
    highlight: "Regional Climate and Quarantine Map",
  },
  {
    icon: Database,
    title: "Up-to-Date Invasive Species Knowledge Base",
    description:
      "Newly detected invasive insect, fungus and weed records are added to the vector database in real time. Cross-border pest movements and alert levels are updated weekly.",
    highlight: "Weekly Synchronized Vector Pool",
  },
  {
    icon: Leaf,
    title: "Practical Protection Steps",
    description:
      "Provides biological control, trapping and cultural care guidelines that minimize chemical load. Offers nature-friendly Integrated Pest Management (IPM) for your garden and urban green spaces.",
    highlight: "Sustainable IPM Methodology",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1440px] px-5 py-20 md:px-12"
    >
      <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-stitch-secondary">
            Capabilities
          </span>
          <h2 className="mt-2 font-stitch-headline text-stitch-headline-lg-mobile text-primary md:text-stitch-headline-lg">
            Plant Health at Scientific Standards
          </h2>
        </div>
        <p className="max-w-md font-stitch-body text-stitch-body-md text-muted-foreground">
          Beyond traditional search engines, a next-generation analysis
          architecture that ties every output to a provable scientific
          publication base.
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
