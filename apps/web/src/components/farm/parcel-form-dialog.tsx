import { useState } from "react";
import { Eraser, Undo2 } from "lucide-react";
import type { ParcelDto } from "@DeparkHackaton/dto";
import { createParcelValidator } from "@DeparkHackaton/validators";
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
import ParcelMap from "@components/farm/parcel-map";
import { useCreateParcel, useUpdateParcel } from "@/lib/farm-api";
import { formatArea, polygonAreaHa } from "@/lib/geo";
import { toFieldErrors, textOrNull, type FieldErrors } from "@/lib/form-errors";

const parcelValidator = createParcelValidator();

interface ParcelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** edit this parcel, a new one is added when it is missing */
  parcel?: ParcelDto;
}

export default function ParcelFormDialog({
  open,
  onOpenChange,
  parcel,
}: ParcelFormDialogProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [polygon, setPolygon] = useState<[number, number][]>(
    parcel?.polygon ?? [],
  );
  const createParcel = useCreateParcel();
  const updateParcel = useUpdateParcel();
  const saving = createParcel.isPending || updateParcel.isPending;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const result = parcelValidator.safeParse({
      name: form.get("name"),
      kind: form.get("kind"),
      notes: textOrNull(form.get("notes")),
      polygon,
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }
    setErrors({});

    try {
      if (parcel) {
        await updateParcel.mutateAsync({ id: parcel.id, patch: result.data });
      } else {
        await createParcel.mutateAsync(result.data);
      }
      onOpenChange(false);
    } catch {
      // the mutation hooks already showed the error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{parcel ? "Edit parcel" : "Add parcel"}</DialogTitle>
          <DialogDescription>
            Click the map to place the corners of your field or garden.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <div className="h-72">
              <ParcelMap
                draft={polygon}
                focus={parcel?.polygon}
                onDraftPoint={(point) => setPolygon((prev) => [...prev, point])}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p
                className={
                  errors.polygon
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
              >
                {polygon.length < 3
                  ? `${polygon.length} of at least 3 corners placed`
                  : `${polygon.length} corners, ${formatArea(polygonAreaHa(polygon))}`}
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={polygon.length === 0}
                  onClick={() => setPolygon((prev) => prev.slice(0, -1))}
                >
                  <Undo2 />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={polygon.length === 0}
                  onClick={() => setPolygon([])}
                >
                  <Eraser />
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="parcel-name">Name</FieldLabel>
                <Input
                  id="parcel-name"
                  name="name"
                  defaultValue={parcel?.name}
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={[{ message: errors.name }]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="parcel-kind">Type</FieldLabel>
                <NativeSelect
                  id="parcel-kind"
                  name="kind"
                  defaultValue={parcel?.kind ?? "field"}
                >
                  <NativeSelectOption value="field">Field</NativeSelectOption>
                  <NativeSelectOption value="garden">Garden</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="parcel-notes">Notes (optional)</FieldLabel>
              <Textarea
                id="parcel-notes"
                name="notes"
                rows={2}
                defaultValue={parcel?.notes}
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
