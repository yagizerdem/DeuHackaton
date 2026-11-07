import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { today } from "@lib/utils";
import deepmerge from "deepmerge";

export interface MapOptions {
  humanSettlementLayer: boolean;
  protectedAreasLayer: boolean;
  modisLandcoverLayer: boolean;
  corineLandcoverLayer: boolean;
  fuelsLayer: boolean;
  countryBoundariesLayer: boolean;
}

const defaultMapOptions: MapOptions = {
  humanSettlementLayer: false,
  protectedAreasLayer: false,
  modisLandcoverLayer: false,
  corineLandcoverLayer: false,
  fuelsLayer: false,
  countryBoundariesLayer: false,
};

export type TFireForcastDangerSource = "ecmwf" | "mf025" | "nasa_geos5";
export type TFWI =
  | {
      full_name: "FIRE_WEATHER_INDEX";
      abbreviation: "FWI";
    }
  | {
      full_name: "INITIAL_SPREAD_INDEX";
      abbreviation: "ISI";
    }
  | {
      full_name: "BUILD_UP_INDEX";
      abbreviation: "BUI";
    }
  | {
      full_name: "FINE_FUEL_MOISTURE_CODE";
      abbreviation: "FFMC";
    }
  | {
      full_name: "DUFF_MOISTURE_CODE";
      abbreviation: "DMC";
    }
  | {
      full_name: "DROUGHT_CODE";
      abbreviation: "DC";
    }
  | {
      full_name: "ANOMALY";
      abbreviation: "FWI";
    }
  | {
      full_name: "RANKING";
      abbreviation: "FWI";
    };

export type TKBDI = {
  full_name: "KEETCH_BYRAM_DROUGHT_INDEX";
  abbreviation: "KBDI";
};

export type TMARK5 =
  | {
      full_name: "DROUGHT_FACTOR";
      abbreviation: "DF";
    }
  | {
      full_name: "RATE_OF_SPREAD";
      abbreviation: "ROS";
    }
  | {
      full_name: "FIRE_DANGER_INDEX";
      abbreviation: "FDI";
    };

export type TNFDRS =
  | {
      full_name: "NFDRS_RATE_OF_SPREAD";
      abbreviation: "NFDRS_ROS";
    }
  | {
      full_name: "NFDRS_SPREAD_COMPONENT";
      abbreviation: "NFDRS_SC";
    }
  | {
      full_name: "NFDRS_ENERGY_RELEASE_COMPONENT";
      abbreviation: "NFDRS_ERC";
    }
  | {
      full_name: "NFDRS_BURNING_INDEX";
      abbreviation: "NFDRS_BI";
    }
  | {
      full_name: "NFDRS_IGNITION_PROBABILITY";
      abbreviation: "NFDRS_IC";
    };

export interface ForecastOptions {
  // fire
  showFireDangerForecast: boolean;
  fireDangerSource: TFireForcastDangerSource;
  fireWeatherIndex: TFWI | TKBDI | TMARK5 | TNFDRS;

  // lightning
  showLightningForecast: boolean;
}

const defaultForecastOptions: ForecastOptions = {
  showFireDangerForecast: false,
  fireDangerSource: "ecmwf",
  fireWeatherIndex: {
    abbreviation: "FWI",
    full_name: "FIRE_WEATHER_INDEX",
  },
  showLightningForecast: false,
};

export type TDamagePeriod = "today" | "week" | "month" | "season" | "custom";
export type TViirsSensor = "all" | "n20" | "n21" | "suomi";
export type TBurntComposite = "none" | "yearly" | "monthly";

export interface DamageAssessmentOptions {
  period: TDamagePeriod;
  customFrom: string;
  customTo: string;

  // active fires
  showModis: boolean;
  showViirs: boolean;
  viirsSensor: TViirsSensor;
  showSentinel3: boolean;

  // burnt areas
  showNrtBurntAreas: boolean;
  burntComposite: TBurntComposite;
}

const defaultDamageAssessmentOptions: DamageAssessmentOptions = {
  period: "month",
  customFrom: today(),
  customTo: today(),
  showModis: false,
  showViirs: false,
  viirsSensor: "all",
  showSentinel3: false,
  showNrtBurntAreas: false,
  burntComposite: "none",
};

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/** [south, west, north, east] */
export type MapBounds = [number, number, number, number];

export type TRightPanel = "chart" | "locator" | null;

export interface RiskMapContextValue {
  mapOptions: MapOptions;
  selectedDate: string;
  forecastOptions: ForecastOptions;
  damageOptions: DamageAssessmentOptions;
  rightPanel: TRightPanel;
  chartPoint: LatLngPoint | null;
  setMapOptions: (patch: Partial<MapOptions>) => void;
  setSelectedDate: (date: string) => void;
  setForecastOptions: (patch: Partial<ForecastOptions>) => void;
  setDamageOptions: (patch: Partial<DamageAssessmentOptions>) => void;
  setRightPanel: (panel: TRightPanel) => void;
  setChartPoint: (point: LatLngPoint) => void;
  /** Kept in a ref so panning the map does not re-render consumers. */
  setMapBounds: (bounds: MapBounds) => void;
  getMapBounds: () => MapBounds | null;
}

const RiskMapContext = createContext<RiskMapContextValue | undefined>(
  undefined,
);

export function RiskMapProvider({ children }: { children: React.ReactNode }) {
  const [mapOptions, setMapOptionsState] = useState(defaultMapOptions);
  const [selectedDate, setSelectedDate] = useState(today);
  const [forecastOptions, setForecastOptionsState] = useState(
    defaultForecastOptions,
  );
  const [damageOptions, setDamageOptionsState] = useState(
    defaultDamageAssessmentOptions,
  );
  const [rightPanel, setRightPanel] = useState<TRightPanel>(null);
  const [chartPoint, setChartPoint] = useState<LatLngPoint | null>(null);
  const mapBounds = useRef<MapBounds | null>(null);

  const setMapOptions = useCallback(
    (patch: Partial<MapOptions>) =>
      setMapOptionsState((prev) => deepmerge(prev, patch)),
    [],
  );
  const setForecastOptions = useCallback(
    (patch: Partial<ForecastOptions>) =>
      setForecastOptionsState((prev) => deepmerge(prev, patch)),
    [],
  );
  const setDamageOptions = useCallback(
    (patch: Partial<DamageAssessmentOptions>) =>
      setDamageOptionsState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const setMapBounds = useCallback((bounds: MapBounds) => {
    mapBounds.current = bounds;
  }, []);
  const getMapBounds = useCallback(() => mapBounds.current, []);

  const value = useMemo(
    () => ({
      mapOptions,
      selectedDate,
      forecastOptions,
      damageOptions,
      rightPanel,
      chartPoint,
      setMapOptions,
      setSelectedDate,
      setForecastOptions,
      setDamageOptions,
      setRightPanel,
      setChartPoint,
      setMapBounds,
      getMapBounds,
    }),
    [
      mapOptions,
      selectedDate,
      forecastOptions,
      damageOptions,
      rightPanel,
      chartPoint,
      setMapOptions,
      setForecastOptions,
      setDamageOptions,
      setMapBounds,
      getMapBounds,
    ],
  );

  return (
    <RiskMapContext.Provider value={value}>{children}</RiskMapContext.Provider>
  );
}

export function useRiskMap() {
  const context = useContext(RiskMapContext);
  if (!context) {
    throw new Error("useRiskMap must be used within a RiskMapProvider");
  }
  return context;
}
