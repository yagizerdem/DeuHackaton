import DefaultLayout from "@/layouts/default-layout";
import SiteHeader from "@components/home/site-header";
import AnalysisForm from "@components/plant-protection-assistant/analysis-form";

export default function PlantProtectionAssistant() {
  return (
    <DefaultLayout>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <h1 className="mb-6 border-b border-border/30 pb-4 font-stitch-headline text-stitch-headline-lg-mobile text-foreground md:text-stitch-headline-md">
          Analysis Workspace
        </h1>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {/* TODO: send the image to the Gemini analysis endpoint */}
            <AnalysisForm isLoading={false} onSubmit={() => {}} />
          </div>
        </div>
      </main>
    </DefaultLayout>
  );
}
