import {
  DANGER_STYLE,
  LEVEL_STYLE,
  type FireRiskAssessment,
} from "@lib/risk-api";

export default function RiskSummary({ risk }: { risk: FireRiskAssessment }) {
  const { structural, weather } = risk;
  const level = structural.level ? LEVEL_STYLE[structural.level] : null;
  const danger = weather.available ? DANGER_STYLE[weather.dangerClass] : null;
  const { terrain } = structural;

  return (
    <div className="space-y-3 text-sm">
      <section>
        <div className="text-xs uppercase text-gray-500">Yapısal risk</div>
        <div className="font-semibold" style={{ color: level?.color }}>
          {level?.label ?? "Veri yok"}
        </div>
        {structural.burnRatio !== null && (
          <div className="text-xs text-gray-600">
            Türkiye ortalamasının {structural.burnRatio} katı yanıyor
          </div>
        )}
        <div className="text-xs text-gray-600">
          {structural.landCover.label}
          {terrain.slopePct !== null && ` · eğim %${terrain.slopePct}`}
          {terrain.elevationM !== null && ` · ${terrain.elevationM} m`}
        </div>
      </section>

      <section>
        <div className="text-xs uppercase text-gray-500">
          Hava tehlikesi {weather.available && `· ${weather.date}`}
        </div>
        {weather.available ? (
          <>
            <div className="font-semibold" style={{ color: danger?.color }}>
              {danger?.label}
            </div>
            <div className="text-xs text-gray-600">FWI {weather.fwi}</div>
          </>
        ) : (
          <div className="text-gray-600">Veri yok</div>
        )}
      </section>

      <p className="text-[11px] leading-tight text-gray-500">
        Yapısal: EFFIS 2022-2025 yanmış alanları. Hava: Kanada FWI, Open-Meteo.
      </p>
    </div>
  );
}
