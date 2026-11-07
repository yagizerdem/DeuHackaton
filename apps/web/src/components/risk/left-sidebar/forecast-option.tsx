import { InfoIcon } from "lucide-react";

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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  type TFireForcastDangerSource,
  type TFWI,
  type TKBDI,
  type TMARK5,
  type TNFDRS,
  useRiskMap,
} from "@providers/risk-map-provider";

const SOURCES: { value: TFireForcastDangerSource; label: string }[] = [
  { value: "ecmwf", label: "ECMWF (8 km res.)" },
  { value: "mf025", label: "Météo-France (10 km res.)" },
  { value: "nasa_geos5", label: "NASA GEOS-5" },
];

type TIndex = TFWI | TKBDI | TMARK5 | TNFDRS;

const INDEX_GROUPS: {
  label: string;
  items: { label: string; index: TIndex }[];
}[] = [
  {
    label: "Fire Weather Index",
    items: [
      {
        label: "Fire Weather Index (FWI)",
        index: { full_name: "FIRE_WEATHER_INDEX", abbreviation: "FWI" },
      },
      {
        label: "Initial Spread Index (ISI)",
        index: { full_name: "INITIAL_SPREAD_INDEX", abbreviation: "ISI" },
      },
      {
        label: "Build Up Index (BUI)",
        index: { full_name: "BUILD_UP_INDEX", abbreviation: "BUI" },
      },
      {
        label: "Fine Fuel Moisture Code (FFMC)",
        index: { full_name: "FINE_FUEL_MOISTURE_CODE", abbreviation: "FFMC" },
      },
      {
        label: "Duff Moisture Code (DMC)",
        index: { full_name: "DUFF_MOISTURE_CODE", abbreviation: "DMC" },
      },
      {
        label: "Drought Code (DC)",
        index: { full_name: "DROUGHT_CODE", abbreviation: "DC" },
      },
      {
        label: "Anomaly (FWI)",
        index: { full_name: "ANOMALY", abbreviation: "FWI" },
      },
      {
        label: "Ranking (FWI)",
        index: { full_name: "RANKING", abbreviation: "FWI" },
      },
    ],
  },
  {
    label: "Mark-5",
    items: [
      {
        label: "Keetch-Byram Drought Index (KBDI)",
        index: {
          full_name: "KEETCH_BYRAM_DROUGHT_INDEX",
          abbreviation: "KBDI",
        },
      },
      {
        label: "Drought Factor (DF)",
        index: { full_name: "DROUGHT_FACTOR", abbreviation: "DF" },
      },
      {
        label: "Rate of Spread (ROS)",
        index: { full_name: "RATE_OF_SPREAD", abbreviation: "ROS" },
      },
      {
        label: "Fire Danger Index (FDI)",
        index: { full_name: "FIRE_DANGER_INDEX", abbreviation: "FDI" },
      },
    ],
  },
  {
    label: "NFDRS",
    items: [
      {
        label: "Rate of Spread (ROS)",
        index: { full_name: "NFDRS_RATE_OF_SPREAD", abbreviation: "NFDRS_ROS" },
      },
      {
        label: "Spread Component (SC)",
        index: {
          full_name: "NFDRS_SPREAD_COMPONENT",
          abbreviation: "NFDRS_SC",
        },
      },
      {
        label: "Energy Release Component (ERC)",
        index: {
          full_name: "NFDRS_ENERGY_RELEASE_COMPONENT",
          abbreviation: "NFDRS_ERC",
        },
      },
      {
        label: "Burning Index (BI)",
        index: { full_name: "NFDRS_BURNING_INDEX", abbreviation: "NFDRS_BI" },
      },
      {
        label: "Ignition Component (IC)",
        index: {
          full_name: "NFDRS_IGNITION_PROBABILITY",
          abbreviation: "NFDRS_IC",
        },
      },
    ],
  },
];

const INDEX_ITEMS = INDEX_GROUPS.flatMap((group) =>
  group.items.map(({ label, index }) => ({ label, value: index.full_name })),
);

const INDEX_BY_NAME = new Map<TIndex["full_name"], TIndex>(
  INDEX_GROUPS.flatMap((group) =>
    group.items.map(({ index }) => [index.full_name, index] as const),
  ),
);

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto text-muted-foreground"
            aria-label="More info"
          />
        }
      >
        <InfoIcon />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-56">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export default function ForecastOption() {
  const { forecastOptions, setForecastOptions } = useRiskMap();
  const source = forecastOptions.fireDangerSource;
  const fireDangerEnabled = forecastOptions.showFireDangerForecast;
  const lightningEnabled = forecastOptions.showLightningForecast;

  function handleIndexChange(value: TIndex["full_name"]) {
    const index = INDEX_BY_NAME.get(value);
    if (index) setForecastOptions({ fireWeatherIndex: index });
  }

  function handleLightningChange(checked: boolean) {
    setForecastOptions({ showLightningForecast: checked });
  }

  return (
    <FieldSet>
      <FieldLegend variant="label">Forecasts</FieldLegend>

      <FieldGroup className="gap-4">
        <Field orientation="horizontal">
          <Checkbox
            id="fire-danger-forecast"
            checked={fireDangerEnabled}
            onCheckedChange={(checked) =>
              setForecastOptions({
                showFireDangerForecast: checked === true,
              })
            }
            className="cursor-pointer"
          />
          <FieldLabel
            htmlFor="fire-danger-forecast"
            className="text-xs font-semibold tracking-wide uppercase"
          >
            Fire danger forecast
          </FieldLabel>
          <InfoTip text="Daily fire danger forecast derived from numerical weather prediction models." />
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="forecast-source" className="w-14 shrink-0">
            Source
          </FieldLabel>
          <FieldContent>
            <Select
              items={SOURCES}
              value={source}
              onValueChange={(value) =>
                value &&
                setForecastOptions({
                  fireDangerSource: value as TFireForcastDangerSource,
                })
              }
            >
              <SelectTrigger id="forecast-source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SOURCES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="forecast-index" className="w-14 shrink-0">
            Index
          </FieldLabel>
          <FieldContent>
            <Select
              items={INDEX_ITEMS}
              value={forecastOptions.fireWeatherIndex.full_name}
              onValueChange={(value) => value && handleIndexChange(value)}
            >
              <SelectTrigger id="forecast-index" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDEX_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map(({ label, index }) => (
                      <SelectItem key={index.full_name} value={index.full_name}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <FieldSeparator />

        <Field orientation="horizontal">
          <Checkbox
            id="lightning-forecast"
            checked={lightningEnabled}
            onCheckedChange={handleLightningChange}
            className="cursor-pointer"
          />
          <FieldLabel
            htmlFor="lightning-forecast"
            className="text-xs font-semibold tracking-wide uppercase"
          >
            Lightning forecast
          </FieldLabel>
          <InfoTip text="Forecasted lightning activity, a major natural ignition source." />
        </Field>

        <FieldSeparator />
      </FieldGroup>
    </FieldSet>
  );
}
