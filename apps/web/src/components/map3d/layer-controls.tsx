import { useId } from "react";
import { Checkbox } from "@components/ui/checkbox";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import type { BuildingsSource } from "@components/map3d/buildings-layer";
import type { ParcelStyle } from "@components/map3d/parcel-layer";
import type { LayerState } from "@/lib/map3d/layers";

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, hint, checked, disabled, onChange }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <label htmlFor={id} className="min-w-0 flex-1 text-sm leading-tight">
        {label}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </label>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 font-stitch-label text-stitch-label-md font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

interface LayerControlsProps {
  layers: LayerState;
  onChange: (patch: Partial<LayerState>) => void;
  /** Cesium ion token present, terrain and buildings need it */
  hasIon: boolean;
}

export default function LayerControls({ layers, onChange, hasIon }: LayerControlsProps) {
  const styleId = useId();
  const opacityId = useId();
  const buildingsId = useId();
  const anyOverlay = layers.burntAreas || layers.fireWeather || layers.landCover;

  return (
    <div className="space-y-4">
      <Group title="Çiftlik">
        <Toggle
          label="Parseller"
          checked={layers.parcels}
          onChange={(parcels) => onChange({ parcels })}
        />
        {layers.parcels && (
          <div className="ml-6">
            <label htmlFor={styleId} className="sr-only">Parsel gösterimi</label>
            <NativeSelect
              id={styleId}
              size="sm"
              value={layers.parcelStyle}
              onChange={(e) => onChange({ parcelStyle: e.target.value as ParcelStyle })}
            >
              <NativeSelectOption value="ground">Araziye yapışık</NativeSelectOption>
              <NativeSelectOption value="extruded">Yükseltilmiş (sorun yoğunluğu)</NativeSelectOption>
            </NativeSelect>
          </div>
        )}
        <Toggle label="Bitki pinleri" checked={layers.plants} onChange={(plants) => onChange({ plants })} />
        <Toggle
          label="Sağlık direkleri"
          hint="Kötü durum daha uzun direk"
          checked={layers.poles}
          disabled={!layers.plants}
          onChange={(poles) => onChange({ poles })}
        />
      </Group>

      <Group title="Tehditler">
        <Toggle
          label="İstilacı tür gözlemleri"
          hint="GBIF, yükseklik ve renk yılı gösterir"
          checked={layers.threats}
          onChange={(threats) => onChange({ threats })}
        />
      </Group>

      <Group title="Yangın ve arazi örtüsü">
        <Toggle
          label="Yanmış alanlar (son 30 gün)"
          hint="GWIS"
          checked={layers.burntAreas}
          onChange={(burntAreas) => onChange({ burntAreas })}
        />
        <Toggle
          label="Yangın hava indeksi (FWI)"
          hint="GWIS, bugün"
          checked={layers.fireWeather}
          onChange={(fireWeather) => onChange({ fireWeather })}
        />
        <Toggle
          label="Arazi örtüsü (CORINE 2018)"
          hint="Orman, mera, tarım; Avrupa ve Türkiye"
          checked={layers.landCover}
          onChange={(landCover) => onChange({ landCover })}
        />
        {anyOverlay && (
          <div className="ml-6 space-y-1">
            <label htmlFor={opacityId} className="text-xs text-muted-foreground">
              Katman saydamlığı
            </label>
            <input
              id={opacityId}
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={layers.overlayOpacity}
              onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </Group>

      <Group title="3B görünüm">
        <label htmlFor={buildingsId} className="sr-only">3B binalar</label>
        <NativeSelect
          id={buildingsId}
          size="sm"
          disabled={!hasIon}
          value={layers.buildings ?? ""}
          onChange={(e) =>
            onChange({ buildings: (e.target.value || null) as BuildingsSource | null })
          }
        >
          <NativeSelectOption value="">Binalar kapalı</NativeSelectOption>
          <NativeSelectOption value="osm">OSM 3B binalar</NativeSelectOption>
          <NativeSelectOption value="google">Google fotogerçekçi 3B</NativeSelectOption>
        </NativeSelect>
        {!hasIon && (
          <p className="text-xs text-muted-foreground">
            3B arazi ve binalar için <code>VITE_CESIUM_ION_TOKEN</code> tanımla (ücretsiz Cesium
            ion hesabı yeterli). Şimdilik küre düz.
          </p>
        )}
      </Group>
    </div>
  );
}
