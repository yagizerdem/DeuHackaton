import { Field, FieldLabel } from "@components/ui/field";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 100];

interface RadiusSelectProps {
  value: number;
  onChange: (radiusKm: number) => void;
}

export default function RadiusSelect({ value, onChange }: RadiusSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor="analysis-radius">Analysis radius</FieldLabel>
      <NativeSelect
        id="analysis-radius"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {RADIUS_OPTIONS_KM.map((km) => (
          <NativeSelectOption key={km} value={km}>
            {km} km
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}
