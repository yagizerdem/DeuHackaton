import { useState } from "react";
import { Link } from "react-router";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Field, FieldLabel } from "@components/ui/field";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import TagEditor from "@components/farm/tag-editor";
import { useAuth } from "@providers/auth-provider";
import { useCreateAnalysisRecord, usePlants } from "@/lib/farm-api";
import type { PlantAnalysisResult } from "@/lib/plant-analysis";

interface SaveRecordDialogProps {
  result: PlantAnalysisResult;
  mode: "standard" | "rag";
}

// Saves an analysis result to the user's records. Only shown to logged in users.
export default function SaveRecordDialog({ result, mode }: SaveRecordDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [plantId, setPlantId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const plants = usePlants();
  const createRecord = useCreateAnalysisRecord();

  if (!user) return null;

  async function save() {
    try {
      await createRecord.mutateAsync({
        ...result,
        mode,
        plantId: plantId || null,
        tags,
      });
      setOpen(false);
    } catch {
      // the mutation hook already showed the error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <BookmarkPlus />
        Save to records
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to records</DialogTitle>
          <DialogDescription>
            Link the diagnosis to one of your plants and label it with tags.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="record-plant">Plant (optional)</FieldLabel>
            <NativeSelect
              id="record-plant"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
            >
              <NativeSelectOption value="">No plant</NativeSelectOption>
              {plants.data?.map((plant) => (
                <NativeSelectOption key={plant.id} value={plant.id}>
                  {plant.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {plants.data?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                You have no plants yet.{" "}
                <Link to="/plants" className="text-primary hover:underline">
                  Add one
                </Link>
                .
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel>Tags (optional)</FieldLabel>
            <TagEditor tags={tags} onChange={setTags} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={createRecord.isPending}>
            {createRecord.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
