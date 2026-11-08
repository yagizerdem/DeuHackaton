import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { ParcelDto, PlantDto } from "@DeparkHackaton/dto";
import { createPlantValidator } from "@DeparkHackaton/validators";
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
import {
  useCreatePlant,
  useRemovePlantPhoto,
  useSetPlantPhoto,
  useUpdatePlant,
} from "@/lib/farm-api";
import { toFieldErrors, textOrNull, type FieldErrors } from "@/lib/form-errors";

const plantValidator = createPlantValidator();

interface PlantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** edit this plant, a new one is added when it is missing */
  plant?: PlantDto;
  parcels: ParcelDto[];
}

function numberOrNull(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text === "" ? null : Number(text);
}

export default function PlantFormDialog({
  open,
  onOpenChange,
  plant,
  parcels,
}: PlantFormDialogProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [coords, setCoords] = useState({
    lat: plant?.location?.lat.toString() ?? "",
    lng: plant?.location?.lng.toString() ?? "",
  });
  const createPlant = useCreatePlant();
  const updatePlant = useUpdatePlant();
  const setPhoto = useSetPlantPhoto();
  const removePhoto = useRemovePlantPhoto();
  const [saving, setSaving] = useState(false);

  function fillMyLocation() {
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) =>
        setCoords({
          lat: position.latitude.toFixed(6),
          lng: position.longitude.toFixed(6),
        }),
      () => toast.error("Could not read your location"),
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const lat = numberOrNull(form.get("lat"));
    const lng = numberOrNull(form.get("lng"));
    const result = plantValidator.safeParse({
      name: form.get("name"),
      latinName: textOrNull(form.get("latinName")),
      careNote: textOrNull(form.get("careNote")),
      parcelId: textOrNull(form.get("parcelId")),
      location: lat === null && lng === null ? null : { lat, lng },
    });

    if (!result.success) {
      setErrors(toFieldErrors(result.error.issues));
      return;
    }
    setErrors({});

    const photo = form.get("photo");
    const newPhoto = photo instanceof File && photo.size > 0 ? photo : null;

    setSaving(true);
    try {
      const saved = plant
        ? await updatePlant.mutateAsync({ id: plant.id, patch: result.data })
        : await createPlant.mutateAsync(result.data);

      if (newPhoto) {
        await setPhoto.mutateAsync({ id: saved.id, image: newPhoto });
      } else if (plant?.photoUpdatedAt && form.get("removePhoto")) {
        await removePhoto.mutateAsync(saved.id);
      }
      onOpenChange(false);
    } catch {
      // the mutation hooks already showed the error
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{plant ? "Edit plant" : "Add plant"}</DialogTitle>
          <DialogDescription>
            Photo, location and a care note help you recognise it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="plant-name">Name</FieldLabel>
              <Input
                id="plant-name"
                name="name"
                defaultValue={plant?.name}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[{ message: errors.name }]} />
            </Field>
            <Field data-invalid={!!errors.latinName}>
              <FieldLabel htmlFor="plant-latin">Latin name (optional)</FieldLabel>
              <Input
                id="plant-latin"
                name="latinName"
                defaultValue={plant?.latinName}
                aria-invalid={!!errors.latinName}
              />
              <FieldError errors={[{ message: errors.latinName }]} />
            </Field>
            <Field data-invalid={!!errors.careNote}>
              <FieldLabel htmlFor="plant-note">Care note (optional)</FieldLabel>
              <Textarea
                id="plant-note"
                name="careNote"
                rows={3}
                defaultValue={plant?.careNote}
                aria-invalid={!!errors.careNote}
              />
              <FieldError errors={[{ message: errors.careNote }]} />
            </Field>
            <Field data-invalid={!!errors.parcelId}>
              <FieldLabel htmlFor="plant-parcel">Parcel (optional)</FieldLabel>
              <NativeSelect
                id="plant-parcel"
                name="parcelId"
                defaultValue={plant?.parcelId ?? ""}
              >
                <NativeSelectOption value="">No parcel</NativeSelectOption>
                {parcels.map((parcel) => (
                  <NativeSelectOption key={parcel.id} value={parcel.id}>
                    {parcel.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[{ message: errors.parcelId }]} />
            </Field>
            <Field data-invalid={!!errors.location}>
              <FieldLabel htmlFor="plant-lat">Location (optional)</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="plant-lat"
                  name="lat"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={coords.lat}
                  onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                />
                <Input
                  name="lng"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  aria-label="Longitude"
                  value={coords.lng}
                  onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Use my location"
                  aria-label="Use my location"
                  onClick={fillMyLocation}
                >
                  <LocateFixed />
                </Button>
              </div>
              <FieldError
                errors={[
                  {
                    message: errors.location
                      ? "Enter both latitude and longitude"
                      : undefined,
                  },
                ]}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="plant-photo">Photo (optional)</FieldLabel>
              <Input
                id="plant-photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
              {plant?.photoUpdatedAt && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" name="removePhoto" />
                  Remove the current photo
                </label>
              )}
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
