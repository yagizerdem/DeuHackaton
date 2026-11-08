import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { LayoutGrid, List, ListChecks, Plus, Search, Sprout, X } from "lucide-react";
import type { PlantHealthStatus, PlantOverviewDto } from "@DeparkHackaton/dto";
import { Button } from "@components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@components/ui/empty";
import { Input } from "@components/ui/input";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { Skeleton } from "@components/ui/skeleton";
import FarmShell from "@components/farm/farm-shell";
import PlantFormDialog from "@components/farm/plant-form-dialog";
import BulkBar from "@components/farm-extras/bulk-bar";
import PlantOverviewCard from "@components/farm-extras/plant-overview-card";
import PlantOverviewTable from "@components/farm-extras/plant-overview-table";
import { STATUS_ORDER, STATUS_STYLE } from "@components/farm-extras/plant-status-badge";
import { useUndoableDelete } from "@/hooks/use-undoable-delete";
import { useParcels, useUpdatePlant } from "@/lib/farm-api";
import {
  requestDeletePlant,
  usePlantOverview,
  useTagPlants,
} from "@/lib/farm-overview-api";

type View = "cards" | "table";
type Sort = "updated" | "created" | "name" | "status" | "analysis";

const SORTS: { value: Sort; label: string }[] = [
  { value: "updated", label: "Son güncellenen" },
  { value: "created", label: "Eklenme tarihi" },
  { value: "analysis", label: "Son analiz" },
  { value: "name", label: "Ad (A-Z)" },
  { value: "status", label: "Durum (kritik önce)" },
];

const collator = new Intl.Collator("tr");
const lower = (text: string) => text.toLocaleLowerCase("tr");
// plants of the same species share the latin name, the common name is the fallback
const speciesOf = (plant: PlantOverviewDto) => plant.latinName || plant.name;

const COMPARE: Record<Sort, (a: PlantOverviewDto, b: PlantOverviewDto) => number> = {
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  created: (a, b) => b.createdAt.localeCompare(a.createdAt),
  analysis: (a, b) =>
    (b.lastAnalysis?.createdAt ?? "").localeCompare(a.lastAnalysis?.createdAt ?? ""),
  name: (a, b) => collator.compare(a.name, b.name),
  status: (a, b) =>
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
    collator.compare(a.name, b.name),
};

export default function PlantsOverviewPage() {
  // "new" opens the empty form, a plant opens it for editing
  const [editor, setEditor] = useState<PlantOverviewDto | "new" | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  // the filters live in the url, so a reload or a shared link keeps them
  const [params, setParams] = useSearchParams();

  const overview = usePlantOverview();
  const parcels = useParcels();
  const updatePlant = useUpdatePlant();
  const tagPlants = useTagPlants();
  const { hidden, schedule } = useUndoableDelete(requestDeletePlant);

  const q = params.get("q") ?? "";
  const species = params.get("species") ?? "";
  const status = params.get("status") ?? "";
  const parcel = params.get("parcel") ?? "";
  const tag = params.get("tag") ?? "";
  const sortParam = params.get("sort");
  const sort: Sort = SORTS.some((s) => s.value === sortParam) ? (sortParam as Sort) : "updated";
  const view: View = params.get("view") === "table" ? "table" : "cards";
  const filtered = [q, species, status, parcel, tag].some(Boolean);

  function setParam(key: string, value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const parcelNames = useMemo(
    () => new Map(parcels.data?.map((p) => [p.id, p.name])),
    [parcels.data],
  );
  const available = useMemo(
    () => overview.data?.filter((p) => !hidden.has(p.id)) ?? [],
    [overview.data, hidden],
  );
  const speciesOptions = useMemo(
    () => [...new Set(available.map(speciesOf))].sort(collator.compare),
    [available],
  );
  const tagOptions = useMemo(
    () => [...new Set(available.flatMap((p) => p.tags))].sort(collator.compare),
    [available],
  );

  const visible = useMemo(() => {
    const needle = lower(q.trim());
    return available
      .filter((p) => {
        if (species && speciesOf(p) !== species) return false;
        if (status && p.status !== status) return false;
        if (parcel && p.parcelId !== parcel) return false;
        if (tag && !p.tags.includes(tag)) return false;
        if (!needle) return true;
        return lower([p.name, p.latinName, p.careNote, ...p.tags].join(" ")).includes(needle);
      })
      .sort(COMPARE[sort]);
  }, [available, q, species, status, parcel, tag, sort]);

  // a plant that is filtered out or deleted can no longer be selected
  const selectedIds = visible.filter((p) => selected.has(p.id)).map((p) => p.id);

  function toggle(id: string, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function deletePlants(plants: PlantOverviewDto[]) {
    const message =
      plants.length === 1 ? `“${plants[0]!.name}” silindi` : `${plants.length} bitki silindi`;
    schedule(
      plants.map((p) => p.id),
      message,
    );
    setSelected(new Set());
  }

  function savePatch(
    id: string,
    patch: { name?: string; latinName?: string; careNote?: string },
  ) {
    updatePlant.mutate({
      id,
      patch: {
        ...(patch.name !== undefined && { name: patch.name }),
        // an emptied cell clears the field
        ...(patch.latinName !== undefined && { latinName: patch.latinName || null }),
        ...(patch.careNote !== undefined && { careNote: patch.careNote || null }),
      },
    });
  }

  function bulkTag(label: string, mode: "add" | "remove") {
    const count = selectedIds.length;
    tagPlants.mutate(
      { ids: selectedIds, [mode]: [label] },
      {
        onSuccess: () =>
          toast.success(
            mode === "add"
              ? `${count} bitkiye “${label}” etiketi eklendi`
              : `${count} bitkiden “${label}” etiketi çıkarıldı`,
          ),
      },
    );
  }

  function clearFilters() {
    setParams(
      (current) => {
        const next = new URLSearchParams();
        const keep = ["sort", "view"].filter((key) => current.has(key));
        keep.forEach((key) => next.set(key, current.get(key)!));
        return next;
      },
      { replace: true },
    );
  }

  const viewButton = (value: View, label: string, Icon: typeof List) => (
    <Button
      size="sm"
      variant={view === value ? "secondary" : "ghost"}
      aria-pressed={view === value}
      onClick={() => setParam("view", value === "cards" ? "" : value)}
    >
      <Icon />
      {label}
    </Button>
  );

  return (
    <FarmShell
      title="Bitki envanteri"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link to="/tasks/board" />}>
            <ListChecks />
            Görev panosu
          </Button>
          <div className="flex rounded-lg border border-border/60 p-0.5" role="group" aria-label="Görünüm">
            {viewButton("cards", "Kartlar", LayoutGrid)}
            {viewButton("table", "Tablo", List)}
          </div>
          <Button onClick={() => setEditor("new")}>
            <Plus />
            Bitki ekle
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={q}
            placeholder="Ad, tür, not veya etiket ara"
            aria-label="Bitki ara"
            onChange={(e) => setParam("q", e.target.value)}
            className="h-8 pl-8"
          />
        </div>
        <NativeSelect aria-label="Türe göre filtrele" value={species} onChange={(e) => setParam("species", e.target.value)}>
          <NativeSelectOption value="">Tüm türler</NativeSelectOption>
          {speciesOptions.map((s) => (
            <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect aria-label="Duruma göre filtrele" value={status} onChange={(e) => setParam("status", e.target.value)}>
          <NativeSelectOption value="">Tüm durumlar</NativeSelectOption>
          {STATUS_ORDER.map((s: PlantHealthStatus) => (
            <NativeSelectOption key={s} value={s}>{STATUS_STYLE[s].label}</NativeSelectOption>
          ))}
        </NativeSelect>
        {!!parcels.data?.length && (
          <NativeSelect aria-label="Parsele göre filtrele" value={parcel} onChange={(e) => setParam("parcel", e.target.value)}>
            <NativeSelectOption value="">Tüm parseller</NativeSelectOption>
            {parcels.data.map((p) => (
              <NativeSelectOption key={p.id} value={p.id}>{p.name}</NativeSelectOption>
            ))}
          </NativeSelect>
        )}
        {tagOptions.length > 0 && (
          <NativeSelect aria-label="Etikete göre filtrele" value={tag} onChange={(e) => setParam("tag", e.target.value)}>
            <NativeSelectOption value="">Tüm etiketler</NativeSelectOption>
            {tagOptions.map((t) => (
              <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>
            ))}
          </NativeSelect>
        )}
        <NativeSelect aria-label="Sırala" value={sort} onChange={(e) => setParam("sort", e.target.value === "updated" ? "" : e.target.value)}>
          {SORTS.map((s) => (
            <NativeSelectOption key={s.value} value={s.value}>{s.label}</NativeSelectOption>
          ))}
        </NativeSelect>
        {filtered && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            <X />
            Filtreleri temizle
          </Button>
        )}
      </div>

      {overview.isSuccess && (
        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
          {filtered ? `${visible.length} / ${available.length} bitki` : `${available.length} bitki`}
        </p>
      )}

      {overview.isPending ? (
        view === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Bitkiler yükleniyor">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <div className="space-y-2" role="status" aria-label="Bitkiler yükleniyor">
            <Skeleton className="h-10" />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        )
      ) : overview.isError ? (
        <p role="alert" className="text-sm text-destructive">Bitkiler yüklenemedi.</p>
      ) : available.length === 0 ? (
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Sprout /></EmptyMedia>
            <EmptyTitle>Henüz bitkin yok</EmptyTitle>
            <EmptyDescription>
              Bitkilerini ekle. Analiz yaptıkça sağlık durumları burada kendiliğinden görünür.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setEditor("new")}>
              <Plus />
              İlk bitkini ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : visible.length === 0 ? (
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>Eşleşen bitki yok</EmptyTitle>
            <EmptyDescription>Arama veya filtrelerle eşleşen bir bitki bulunamadı.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={clearFilters}>Filtreleri temizle</Button>
          </EmptyContent>
        </Empty>
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((plant) => (
            <PlantOverviewCard
              key={plant.id}
              plant={plant}
              parcelName={plant.parcelId ? parcelNames.get(plant.parcelId) : undefined}
              selected={selected.has(plant.id)}
              onSelect={(on) => toggle(plant.id, on)}
              onEdit={() => setEditor(plant)}
              onDelete={() => deletePlants([plant])}
            />
          ))}
        </div>
      ) : (
        <PlantOverviewTable
          plants={visible}
          parcelNames={parcelNames}
          selected={selected}
          onToggle={toggle}
          onToggleAll={(on) => setSelected(on ? new Set(visible.map((p) => p.id)) : new Set())}
          onRename={savePatch}
          onEdit={setEditor}
          onDelete={(plant) => deletePlants([plant])}
        />
      )}

      {selectedIds.length > 0 && (
        <BulkBar
          count={selectedIds.length}
          knownTags={tagOptions}
          busy={tagPlants.isPending}
          onTag={bulkTag}
          onDelete={() => deletePlants(visible.filter((p) => selected.has(p.id)))}
          onClear={() => setSelected(new Set())}
        />
      )}

      {editor && (
        <PlantFormDialog
          open
          onOpenChange={(open) => !open && setEditor(null)}
          plant={editor === "new" ? undefined : editor}
          parcels={parcels.data ?? []}
        />
      )}
    </FarmShell>
  );
}

