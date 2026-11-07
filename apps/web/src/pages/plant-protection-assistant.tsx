import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DefaultLayout from "@/layouts/default-layout";
import SiteHeader from "@components/home/site-header";
import AnalysisForm from "@components/plant-protection-assistant/analysis-form";
import AnalysisResult from "@components/plant-protection-assistant/analysis-result";
import ResultSkeleton from "@components/plant-protection-assistant/result-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { analyzePlantImage } from "@/lib/plant-analysis";

// the query client comes from DefaultLayout, so the mutation lives one level below it
function AssistantWorkspace() {
  const mutation = useMutation({
    mutationFn: analyzePlantImage,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Image analysis failed")),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <h1 className="mb-6 border-b border-border/30 pb-4 font-stitch-headline text-stitch-headline-lg-mobile text-foreground md:text-stitch-headline-md">
          Analysis Workspace
        </h1>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnalysisForm
              isLoading={mutation.isPending}
              onSubmit={(image) => mutation.mutate(image)}
            />
          </div>
          <div className="lg:col-span-7">
            {mutation.isPending && <ResultSkeleton />}
            {mutation.data && !mutation.isPending && (
              <AnalysisResult result={mutation.data} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function PlantProtectionAssistant() {
  return (
    <DefaultLayout>
      <AssistantWorkspace />
    </DefaultLayout>
  );
}
