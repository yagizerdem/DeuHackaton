import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import AnalysisForm from "@components/plant-protection-assistant/analysis-form";
import AnalysisResult from "@components/plant-protection-assistant/analysis-result";
import ResultSkeleton from "@components/plant-protection-assistant/result-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  analyzePlantImage,
  analyzePlantImageWithRag,
} from "@/lib/plant-analysis";

// the query client comes from AppLayout, so the mutation lives one level below it
function AssistantWorkspace() {
  const mutation = useMutation({
    mutationFn: analyzePlantImage,
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Image analysis failed")),
  });
  // same image, but the assessment is grounded in the knowledge base
  const ragMutation = useMutation({
    mutationFn: analyzePlantImageWithRag,
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Knowledge base analysis failed"),
      ),
  });

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <h1 className="mb-6 border-b border-border/30 pb-4 font-stitch-headline text-stitch-headline-lg-mobile text-foreground md:text-stitch-headline-md">
          Analysis Workspace
        </h1>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnalysisForm
              isLoading={mutation.isPending || ragMutation.isPending}
              onSubmit={(image) => {
                mutation.mutate(image);
                ragMutation.mutate(image);
              }}
            />
          </div>
          <div className="space-y-6 lg:col-span-7">
            {mutation.isPending && <ResultSkeleton />}
            {mutation.data && !mutation.isPending && (
              <AnalysisResult result={mutation.data} title="Standard analysis" />
            )}
            {ragMutation.isPending && <ResultSkeleton />}
            {ragMutation.data && !ragMutation.isPending && (
              <AnalysisResult
                result={ragMutation.data}
                title="Knowledge base analysis"
                sources={ragMutation.data.sources}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function PlantProtectionAssistant() {
  return (
    <AppLayout>
      <AssistantWorkspace />
    </AppLayout>
  );
}
