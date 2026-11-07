import MapOptions from "@components/risk/left-sidebar/map-options";
import ForecastOption from "@components/risk/left-sidebar/forecast-option";
import DamageAssessment from "@components/risk/left-sidebar/damage-assessment";

export default function LeftSidebar() {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-background p-4">
      <MapOptions />
      <ForecastOption />
      <DamageAssessment />
    </div>
  );
}
