import { X } from "lucide-react";
import type {
  AnalysisRecordDto,
  BoardTaskDto,
  InvasiveObservationDto,
  ParcelDto,
  PlantOverviewDto,
} from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import PlantStatusBadge from "@components/farm-extras/plant-status-badge";
import { formatDate } from "@components/farm-extras/format";
import ObservationDetail from "@components/map3d/observation-detail";
import TerrainSummary from "@components/map3d/terrain-summary";
import { formatArea, polygonAreaHa } from "@/lib/geo";
import { photoUrl } from "@/lib/farm-api";
import type { MapSelection } from "@/lib/map3d/selection";
import {
  STATUS_HEX,
  STATUS_LABEL,
  STATUS_ORDER,
  type ParcelStats,
} from "@/lib/map3d/status";

interface InfoPanelProps {
  selection: MapSelection | null;
  parcels: ParcelDto[];
  plants: PlantOverviewDto[];
  tasks: BoardTaskDto[];
  records: AnalysisRecordDto[];
  stats: ReadonlyMap<string, ParcelStats>;
  observations: InvasiveObservationDto[];
  onClose: () => void;
}

function Shell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside className="absolute left-3 top-3 z-10 max-h-[calc(100%-1.5rem)] w-80 max-w-[calc(100%-1.5rem)] space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-card/95 p-4 text-sm shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-stitch-headline text-stitch-headline-sm text-foreground">
            {title}
          </h2>
          {subtitle && <p className="text-xs italic text-muted-foreground">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="icon-xs" aria-label="Kapat" onClick={onClose}>
          <X />
        </Button>
      </div>
      {children}
    </aside>
  );
}

function ParcelInfo({
  parcel,
  stats,
  onClose,
}: {
  parcel: ParcelDto;
  stats: ParcelStats | undefined;
  onClose: () => void;
}) {
  return (
    <Shell
      title={parcel.name}
      subtitle={`${parcel.kind === "garden" ? "Bahçe" : "Tarla"} · ${formatArea(polygonAreaHa(parcel.polygon))}`}
      onClose={onClose}
    >
      {stats ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.filter((s) => stats.counts[s] > 0).map((s) => (
              <Badge key={s} variant="secondary" style={{ borderColor: STATUS_HEX[s] }}>
                <span className="size-1.5 rounded-full" style={{ background: STATUS_HEX[s] }} aria-hidden />
                {STATUS_LABEL[s]} {stats.counts[s]}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.plants} bitki · {stats.openTasks} açık görev
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Bu parselde kayıtlı bitki yok.</p>
      )}
      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Arazi
        </h3>
        <TerrainSummary polygon={parcel.polygon} />
      </div>
    </Shell>
  );
}

function PlantInfo({
  plant,
  tasks,
  records,
  onClose,
}: {
  plant: PlantOverviewDto;
  tasks: BoardTaskDto[];
  records: AnalysisRecordDto[];
  onClose: () => void;
}) {
  const photo = photoUrl(plant);
  const latest = records
    .filter((r) => r.plantId === plant.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const summary = (latest?.analysis as { summary?: string } | undefined)?.summary;
  const open = tasks.filter((t) => t.plantId === plant.id && t.status !== "done");

  return (
    <Shell title={plant.name} subtitle={plant.latinName} onClose={onClose}>
      {photo && (
        <img src={photo} alt={plant.name} className="aspect-video w-full rounded-lg object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <PlantStatusBadge status={plant.status} />
        {plant.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Son analiz
        </h3>
        {latest ? (
          <>
            <p className="text-xs text-muted-foreground">{formatDate(latest.createdAt)}</p>
            {summary && <p className="mt-1 text-xs">{summary}</p>}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Bu bitki için analiz kaydı yok.</p>
        )}
      </div>
      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Açık görevler ({open.length})
        </h3>
        {open.length === 0 ? (
          <p className="text-xs text-muted-foreground">Açık görev yok.</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {open.map((task) => (
              <li key={task.id} className="flex justify-between gap-2">
                <span>{task.title}</span>
                <span className="shrink-0 text-muted-foreground">{formatDate(task.dueDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}

export default function InfoPanel({
  selection,
  parcels,
  plants,
  tasks,
  records,
  stats,
  observations,
  onClose,
}: InfoPanelProps) {
  if (!selection) return null;

  if (selection.kind === "parcel") {
    const parcel = parcels.find((p) => p.id === selection.id);
    return parcel ? (
      <ParcelInfo parcel={parcel} stats={stats.get(parcel.id)} onClose={onClose} />
    ) : null;
  }
  if (selection.kind === "plant") {
    const plant = plants.find((p) => p.id === selection.id);
    return plant ? (
      <PlantInfo plant={plant} tasks={tasks} records={records} onClose={onClose} />
    ) : null;
  }
  const observation = observations.find((o) => o.id === selection.id);
  return observation ? (
    <div className="absolute left-3 top-3 z-10 w-72 max-w-[calc(100%-1.5rem)]">
      <ObservationDetail observation={observation} onClose={onClose} />
    </div>
  ) : null;
}
