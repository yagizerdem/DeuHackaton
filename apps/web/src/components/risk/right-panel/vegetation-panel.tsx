import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { Skeleton } from "@components/ui/skeleton";
import { getApiErrorMessage } from "@lib/api-error";
import {
  fetchVegetation,
  VEGETATION_RADIUS_KM,
  type LandCoverGroup,
  type VegetationAnalysis,
} from "@lib/vegetation-api";
import { useRiskMap } from "@providers/risk-map-provider";

const GROUP_COLORS: Record<LandCoverGroup, string> = {
  forest: "#15803d",
  natural_vegetation: "#84cc16",
  agricultural: "#eab308",
  wetland: "#14b8a6",
  water: "#3b82f6",
  sparse: "#a8a29e",
  artificial: "#64748b",
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2 text-center">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function LandCover({ data }: { data: NonNullable<VegetationAnalysis["landCover"]> }) {
  return (
    <section>
      <Heading>Bitki örtüsü</Heading>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-green-700">
          %{data.vegetationPercent}
        </span>
        <span className="text-xs text-muted-foreground">
          bitki örtüsüyle kaplı (tarım dahil)
        </span>
      </div>

      <div
        role="img"
        aria-label="Arazi örtüsü grupları"
        className="flex h-3 overflow-hidden rounded-full bg-muted"
      >
        {data.groups.map((g) => (
          <div
            key={g.group}
            title={`${g.label} %${g.percent}`}
            style={{ width: `${g.percent}%`, backgroundColor: GROUP_COLORS[g.group] }}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1 text-xs">
        {data.groups.map((g) => (
          <li key={g.group} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: GROUP_COLORS[g.group] }}
            />
            <span className="flex-1">{g.label}</span>
            <span className="font-medium tabular-nums">%{g.percent}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Heading>Arazi örtüsü sınıfları</Heading>
        <ul className="space-y-1.5 text-xs">
          {data.classes.slice(0, 8).map((c) => (
            <li key={c.code}>
              <div className="flex justify-between gap-2">
                <span>{c.label}</span>
                <span className="font-medium tabular-nums">%{c.percent}</span>
              </div>
              <div className="mt-0.5 h-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.percent}%`,
                    backgroundColor: GROUP_COLORS[c.group],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Result({ data }: { data: VegetationAnalysis }) {
  const { landCover, species, terrain, climate } = data;

  return (
    <div className="space-y-5 text-sm">
      <ul className="list-disc space-y-1 pl-4 text-foreground">
        {data.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {landCover && <LandCover data={landCover} />}

      {species && species.items.length > 0 && (
        <section>
          <Heading>Gözlenen bitki türleri</Heading>
          <ul className="space-y-1 text-xs">
            {species.items.map((s) => (
              <li key={s.name} className="flex justify-between gap-2">
                <span className="italic">{s.name}</span>
                <span className="font-medium tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Toplam {species.totalOccurrences} gözlem, ilk {species.items.length} tür
            gösteriliyor.
          </p>
        </section>
      )}

      {(terrain || climate) && (
        <section>
          <Heading>Bölge koşulları</Heading>
          <div className="grid grid-cols-3 gap-2">
            {terrain && <Stat label="Rakım" value={`${terrain.elevationM} m`} />}
            {climate && (
              <>
                <Stat label="Ort. sıcaklık" value={`${climate.meanTempC} °C`} />
                <Stat label="Yıllık yağış" value={`${climate.annualPrecipMm} mm`} />
              </>
            )}
          </div>
          {climate && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              İklim değerleri {climate.year} yılına aittir.
            </p>
          )}
        </section>
      )}

      {data.unavailable.length > 0 && (
        <p role="alert" className="text-xs text-destructive">
          Şu kaynaklara ulaşılamadı: {data.unavailable.join(", ")}.
        </p>
      )}

      <p className="border-t pt-3 text-[11px] leading-snug text-muted-foreground">
        Arazi örtüsü: CORINE Land Cover {landCover?.year ?? 2018} (en küçük birim
        25 ha, yaklaşık {VEGETATION_RADIUS_KM} km yarıçap örneklenir). Türler:
        GBIF gözlemleri, gözlem yoğunluğuna göre yanlı olabilir. İklim ve rakım:
        Open-Meteo. Sonuçlar bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div role="status" aria-label="Bitki örtüsü analiz ediliyor" className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function VegetationPanel() {
  const { vegetationPoint: point } = useRiskMap();

  const { data, error, isPending } = useQuery({
    queryKey: ["vegetation", point?.lat.toFixed(4), point?.lng.toFixed(4)],
    queryFn: ({ signal }) => fetchVegetation(point!.lat, point!.lng, signal),
    enabled: point !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!point) {
    return (
      <p className="text-sm text-muted-foreground">
        Bitki örtüsünü analiz etmek için haritada bir noktaya tıkla.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {point.lat.toFixed(4)}, {point.lng.toFixed(4)} · {VEGETATION_RADIUS_KM} km
        yarıçap
      </p>
      {isPending && <Loading />}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {isAxiosError(error) && error.response?.status === 401
            ? "Bu analiz için giriş yapmalısın."
            : getApiErrorMessage(error, "Bitki örtüsü analizi yapılamadı.")}
        </p>
      )}
      {data && <Result data={data} />}
    </div>
  );
}
