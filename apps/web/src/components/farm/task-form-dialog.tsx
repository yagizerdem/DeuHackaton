import { useState } from "react";
import type { ParcelDto, PlantDto, TaskDto } from "@DeparkHackaton/dto";
import { createTaskValidator } from "@DeparkHackaton/validators";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@components/ui/field";
import { Input } from "@components/ui/input";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { Textarea } from "@components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/lib/farm-api";
import { toFieldErrors, textOrNull, type FieldErrors } from "@/lib/form-errors";

const taskValidator = createTaskValidator();

// <input type="datetime-local"> wants local time without a zone
function toLocalInput(iso: string) {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function tomorrowMorning() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return toLocalInput(date.toISOString());
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** edit this task, a new one is added when it is missing */
  task?: TaskDto;
  plants: PlantDto[];
  parcels: ParcelDto[];
}

export default function TaskFormDialog({
  open,
  onOpenChange,
  task,
  plants,
  parcels,
}: TaskFormDialogProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const saving = createTask.isPending || updateTask.isPending;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const due = form.get("dueDate");
    const result = taskValidator.safeParse({
      title: form.get("title"),
      notes: textOrNull(form.get("notes")),
      // the input value is local time, the API takes an ISO date-time
      dueDate:
        typeof due === "string" && due ? new Date(due).toISOString() : "",
      repeat: form.get("repeat"),
      plantId: textOrNull(form.get("plantId")),
      parcelId: textOrNull(form.get("parcelId")),
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }
    setErrors({});

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, patch: result.data });
      } else {
        await createTask.mutateAsync(result.data);
      }
      onOpenChange(false);
    } catch {
      // the mutation hooks already showed the error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            A repeating task creates its next one when you complete it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                name="title"
                placeholder="Spray the olive trees"
                defaultValue={task?.title}
                aria-invalid={!!errors.title}
              />
              <FieldError errors={[{ message: errors.title }]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.dueDate}>
                <FieldLabel htmlFor="task-due">Due</FieldLabel>
                <Input
                  id="task-due"
                  name="dueDate"
                  type="datetime-local"
                  defaultValue={
                    task ? toLocalInput(task.dueDate) : tomorrowMorning()
                  }
                  aria-invalid={!!errors.dueDate}
                />
                <FieldError
                  errors={[
                    { message: errors.dueDate && "Pick a date and time" },
                  ]}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="task-repeat">Repeat</FieldLabel>
                <NativeSelect
                  id="task-repeat"
                  name="repeat"
                  defaultValue={task?.repeat ?? "none"}
                >
                  <NativeSelectOption value="none">Does not repeat</NativeSelectOption>
                  <NativeSelectOption value="daily">Every day</NativeSelectOption>
                  <NativeSelectOption value="weekly">Every week</NativeSelectOption>
                  <NativeSelectOption value="monthly">Every month</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="task-plant">Plant (optional)</FieldLabel>
                <NativeSelect
                  id="task-plant"
                  name="plantId"
                  defaultValue={task?.plantId ?? ""}
                >
                  <NativeSelectOption value="">No plant</NativeSelectOption>
                  {plants.map((plant) => (
                    <NativeSelectOption key={plant.id} value={plant.id}>
                      {plant.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="task-parcel">Parcel (optional)</FieldLabel>
                <NativeSelect
                  id="task-parcel"
                  name="parcelId"
                  defaultValue={task?.parcelId ?? ""}
                >
                  <NativeSelectOption value="">No parcel</NativeSelectOption>
                  {parcels.map((parcel) => (
                    <NativeSelectOption key={parcel.id} value={parcel.id}>
                      {parcel.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="task-notes">Notes (optional)</FieldLabel>
              <Textarea
                id="task-notes"
                name="notes"
                rows={2}
                defaultValue={task?.notes}
                aria-invalid={!!errors.notes}
              />
              <FieldError errors={[{ message: errors.notes }]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
