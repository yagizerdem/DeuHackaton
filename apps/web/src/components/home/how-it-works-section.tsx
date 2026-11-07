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
    title: "Identifies the Plant Species",
    description:
      "Determines the species' Latin taxonomy and morphological traits.",
    tag: "Input Parsing",
  },
  {
    icon: MapPinned,
    title: "Assesses the Location",
    description:
      "Examines regional climate, microclimate and local invasive-species migration maps.",
    tag: "Geographic Vectors",
  },
  {
    icon: Bug,
    title: "Retrieves Invasive Species from the Knowledge Base",
    description:
      "Pulls current pests from EPPO, the Ministry of Agriculture and academic databases.",
    tag: "Semantic Search",
  },
  {
    icon: ShieldCheck,
    title: "Researches Protective Measures",
    description:
      "Scans eco-friendly, biological and Integrated Pest Management (IPM) methods.",
    tag: "Protocol Filtering",
  },
  {
    icon: Library,
    title: "Answers with Citations",
    description:
      "Delivers a reliable report citing peer-reviewed articles and official guidelines.",
    tag: "Source Verification",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="w-full border-y border-border/30 bg-stitch-surface-container-low/70 py-20"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-stitch-secondary">
            Methodology & Algorithm
          </span>
          <h2 className="mt-2 font-stitch-headline text-stitch-headline-lg-mobile text-primary md:text-stitch-headline-lg">
            How It Works
          </h2>
          <p className="mt-3 font-stitch-body text-stitch-body-lg text-muted-foreground">
            A 5-step scientific RAG process from your question to a verified
            academic answer.
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
