import { FlameIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { today } from "@lib/utils";
import {
  type DamageAssessmentOptions,
  type TBurntComposite,
  type TDamagePeriod,
  type TViirsSensor,
  useRiskMap,
} from "@providers/risk-map-provider";

const PERIODS: { value: TDamagePeriod; label: string }[] = [
  { value: "today", label: "Last 1 Day" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "season", label: "Fire season" },
  { value: "custom", label: "Custom dates" },
];

const VIIRS_SENSORS: { value: TViirsSensor; label: string }[] = [
  { value: "all", label: "VIIRS (all)" },
  { value: "n20", label: "VIIRS NOAA-20" },
  { value: "n21", label: "VIIRS NOAA-21" },
  { value: "suomi", label: "VIIRS Suomi NPP" },
];

const BURNT_COMPOSITES: { value: TBurntComposite; label: string }[] = [
  { value: "none", label: "BA composite: off" },
  { value: "yearly", label: "BA Yearly" },
  { value: "monthly", label: "BA Monthly" },
];

type BooleanOption = {
  [
    K in keyof DamageAssessmentOptions
  ]: DamageAssessmentOptions[K] extends boolean ? K : never;
}[keyof DamageAssessmentOptions];

export default function DamageAssessment() {
  const {
    damageOptions: options,
    setDamageOptions,
    setRightPanel,
  } = useRiskMap();

  function update(patch: Partial<DamageAssessmentOptions>) {
    setDamageOptions(patch);
  }

  function renderCheckbox(key: BooleanOption, label: string) {
    return (
      <Field orientation="horizontal">
        <Checkbox
          id={key}
          checked={options[key]}
          onCheckedChange={(checked) => update({ [key]: checked === true })}
          className="border border-black cursor-pointer"
        />
        <FieldLabel htmlFor={key} className="font-normal">
          {label}
        </FieldLabel>
      </Field>
    );
  }

  return (
    <FieldSet>
      <FieldLegend variant="label" className="flex items-center gap-1.5">
        <FlameIcon className="size-3.5 text-orange-500" />
        Rapid Damage Assessment
      </FieldLegend>

      <div className="grid grid-cols-2 gap-2">
        {PERIODS.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={options.period === value ? "default" : "outline"}
            className={value === "custom" ? "col-span-2" : undefined}
            onClick={() => update({ period: value })}
          >
            {label}
          </Button>
        ))}
      </div>

      {options.period === "custom" && (
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            aria-label="From"
            value={options.customFrom}
            max={options.customTo}
            onChange={(e) => update({ customFrom: e.target.value || today() })}
            className="min-w-0 flex-1 rounded-md border px-2 py-1"
          />
          –
          <input
            type="date"
            aria-label="To"
            value={options.customTo}
            min={options.customFrom}
            max={today()}
            onChange={(e) => update({ customTo: e.target.value || today() })}
            className="min-w-0 flex-1 rounded-md border px-2 py-1"
          />
        </div>
      )}

      <FieldSeparator />

      <FieldGroup className="gap-3">
        <FieldLegend variant="label">Active fires</FieldLegend>
        {renderCheckbox("showModis", "MODIS")}

        <Field orientation="horizontal">
          <Checkbox
            id="showViirs"
            checked={options.showViirs}
            onCheckedChange={(checked) =>
              update({ showViirs: checked === true })
            }
            className="border border-black cursor-pointer"
          />
          <FieldContent>
            <Select
              items={VIIRS_SENSORS}
              value={options.viirsSensor}
              onValueChange={(value) =>
                value && update({ viirsSensor: value as TViirsSensor })
              }
            >
              <SelectTrigger aria-label="VIIRS sensor" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {VIIRS_SENSORS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        {renderCheckbox("showSentinel3", "SENTINEL3")}
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup className="gap-3">
        <FieldLegend variant="label">Burnt areas</FieldLegend>
        {renderCheckbox("showNrtBurntAreas", "MODIS & VIIRS NRT")}

        <Select
          items={BURNT_COMPOSITES}
          value={options.burntComposite}
          onValueChange={(value) =>
            value && update({ burntComposite: value as TBurntComposite })
          }
        >
          <SelectTrigger aria-label="Burnt area composite" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {BURNT_COMPOSITES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="self-center"
          onClick={() => setRightPanel("locator")}
        >
          Burnt Area Locator
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
