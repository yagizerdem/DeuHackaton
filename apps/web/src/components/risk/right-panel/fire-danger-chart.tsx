import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { fetchFireDangerSeries, type FireDangerSeries } from "@lib/gwis";
import {
  type TFireForcastDangerSource,
  useRiskMap,
} from "@providers/risk-map-provider";

const SOURCES: { value: TFireForcastDangerSource; label: string }[] = [
  { value: "ecmwf", label: "ECMWF (8 km res.)" },
  { value: "mf025", label: "Météo-France (10 km res.)" },
  { value: "nasa_geos5", label: "NASA GEOS-5" },
];

// `key` identifies the request a result belongs to; a mismatch means loading
type Result = { key: string } & (
  | { status: "done"; series: FireDangerSeries[] }
  | { status: "error"; message: string }
);

const chartConfig = { value: { label: "Value", color: "#9ca3af" } };

function IndexChart({ series }: { series: FireDangerSeries }) {
  return (
    <section>
      <h3 className="mb-1 text-sm font-bold">{series.label}</h3>
      <ChartContainer config={chartConfig} className="h-36 w-full">
        <AreaChart data={series.data} margin={{ left: 0, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tickLine={false}
            axisLine={false}
            fontSize={10}
          />
          <YAxis
            width={32}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tickFormatter={(v: number) => String(Math.round(v * 10) / 10)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            fill="var(--color-value)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}

export default function FireDangerChart() {
  const { chartPoint: point, selectedDate: date } = useRiskMap();
  const [source, setSource] = useState<TFireForcastDangerSource>("ecmwf");
  const [result, setResult] = useState<Result>();
  const key = point ? `${point.lat},${point.lng},${source},${date}` : "";

  useEffect(() => {
    if (!point) return;
    const controller = new AbortController();
    fetchFireDangerSeries(point.lat, point.lng, source, date, controller.signal)
      .then((series) => setResult({ key, status: "done", series }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          status: "error",
          message: String(err.message ?? err),
        });
      });
    return () => controller.abort();
  }, [point, source, date, key]);

  const current = result?.key === key ? result : undefined;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <div className="text-xs">
          <b>Coordinate:</b>{" "}
          {point
            ? `[${point.lng.toFixed(4)}, ${point.lat.toFixed(4)}]`
            : "click on the map"}
        </div>
        <div className="mt-1 text-xs font-bold">Source:</div>
        <Select
          items={SOURCES}
          value={source}
          onValueChange={(value) =>
            value && setSource(value as TFireForcastDangerSource)
          }
        >
          <SelectTrigger aria-label="Source" className="w-full">
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
      </div>

      {!point && (
        <p className="text-muted-foreground">
          Click a location on the map to see its fire danger forecast.
        </p>
      )}
      {point && !current && <p className="text-muted-foreground">Loading…</p>}
      {current?.status === "error" && (
        <p className="text-destructive">Error: {current.message}</p>
      )}
      {current?.status === "done" &&
        current.series.map((series) => (
          <IndexChart key={series.label} series={series} />
        ))}
    </div>
  );
}
