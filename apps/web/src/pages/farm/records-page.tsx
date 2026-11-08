import { useState } from "react";
import { Link } from "react-router";
import { Microscope } from "lucide-react";
import { buttonVariants } from "@components/ui/button";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { Skeleton } from "@components/ui/skeleton";
import FarmShell from "@components/farm/farm-shell";
import RecordCard from "@components/farm/record-card";
import {
  useAnalysisRecords,
  useDeleteAnalysisRecord,
  usePlants,
  useUpdateAnalysisRecord,
} from "@/lib/farm-api";

export default function RecordsPage() {
  const [tag, setTag] = useState("");
  const [plantId, setPlantId] = useState("");
  const records = useAnalysisRecords();
  const plants = usePlants();
  const updateRecord = useUpdateAnalysisRecord();
  const deleteRecord = useDeleteAnalysisRecord();

  const allTags = [...new Set(records.data?.flatMap((r) => r.tags))].sort();
  const visible = records.data?.filter(
    (r) =>
      (!tag || r.tags.includes(tag)) && (!plantId || r.plantId === plantId),
  );

  return (
    <FarmShell
      title="Analysis records"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {allTags.length > 0 && (
            <NativeSelect
              aria-label="Filter by tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <NativeSelectOption value="">All tags</NativeSelectOption>
              {allTags.map((t) => (
                <NativeSelectOption key={t} value={t}>
                  {t}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
          {!!plants.data?.length && (
            <NativeSelect
              aria-label="Filter by plant"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            >
              <NativeSelectOption value="">All plants</NativeSelectOption>
              {plants.data.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
          <Link to="/plant-protection-assistant" className={buttonVariants()}>
            <Microscope />
            New analysis
          </Link>
        </div>
      }
    >
      {records.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : records.isError ? (
        <p className="text-sm text-destructive">Could not load your records.</p>
      ) : visible?.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {records.data.length === 0
            ? "No saved analyses yet. Run an analysis and use Save to records."
            : "No records match these filters."}
        </p>
      ) : (
        <div className="space-y-4">
          {visible?.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              plants={plants.data ?? []}
              busy={updateRecord.isPending || deleteRecord.isPending}
              onTagsChange={(tags) =>
                updateRecord.mutate({ id: record.id, patch: { tags } })
              }
              onPlantChange={(id) =>
                updateRecord.mutate({ id: record.id, patch: { plantId: id } })
              }
              onDelete={() => deleteRecord.mutate(record.id)}
            />
          ))}
        </div>
      )}
    </FarmShell>
  );
}
