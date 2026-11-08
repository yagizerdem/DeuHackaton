import { useEffect } from "react";
import { ClockRange, JulianDate, type Viewer } from "cesium";
import type { AnalysisRecordDto } from "@DeparkHackaton/dto";
import { useViewer } from "@components/map3d/viewer-context";

const PLAYBACK_SECONDS = 20;
const DEFAULT_SPAN_DAYS = 30;

// The clock spans the first analysis record up to now. Outside the time mode it
// rests at "now", where every plant shows its current status.
function applyTimeMode(
  viewer: Viewer,
  enabled: boolean,
  records: AnalysisRecordDto[],
) {
  const clock = viewer.clock;
  const stop = JulianDate.now();
  const dates = records
    .filter((r) => r.plantId)
    .map((r) => JulianDate.fromIso8601(r.createdAt));
  const start = dates.length
    ? dates.reduce((a, b) => (JulianDate.lessThan(a, b) ? a : b))
    : JulianDate.addDays(stop, -DEFAULT_SPAN_DAYS, new JulianDate());
  const seconds = Math.max(JulianDate.secondsDifference(stop, start), 60);

  clock.startTime = start.clone();
  clock.stopTime = stop.clone();
  clock.clockRange = ClockRange.LOOP_STOP;
  clock.multiplier = seconds / PLAYBACK_SECONDS;
  clock.shouldAnimate = false;
  clock.currentTime = (enabled ? start : stop).clone();

  (viewer.animation.container as HTMLElement).style.display = enabled ? "" : "none";
  (viewer.timeline.container as HTMLElement).style.display = enabled ? "" : "none";
  if (enabled) {
    viewer.timeline.zoomTo(start, stop);
    // the widgets were hidden while the viewer was laid out
    viewer.animation.resize();
    viewer.timeline.resize();
  }
  viewer.scene.requestRender();
}

interface TimeControllerProps {
  enabled: boolean;
  records: AnalysisRecordDto[];
}

// Time mode shows Cesium's own animation and timeline widgets. The plant pins
// read the clock, so pressing play replays how their health changed.
export default function TimeController({ enabled, records }: TimeControllerProps) {
  const viewer = useViewer();

  useEffect(() => {
    applyTimeMode(viewer, enabled, records);
    return () => {
      if (!viewer.isDestroyed()) viewer.clock.shouldAnimate = false;
    };
  }, [viewer, enabled, records]);

  return null;
}
