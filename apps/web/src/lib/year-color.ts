// Old observations are cool, recent ones are hot, so the newest threats stand out.
const STOPS: [number, number, number][] = [
  [44, 123, 182],
  [171, 217, 233],
  [253, 174, 97],
  [215, 25, 28],
];

export interface YearRange {
  min: number;
  max: number;
}

// 0 for the oldest year of the range, 1 for the newest
export function yearFraction(year: number, { min, max }: YearRange) {
  return max === min ? 1 : (year - min) / (max - min);
}

export function yearRgb(fraction: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, fraction)) * (STOPS.length - 1);
  const i = Math.min(Math.floor(t), STOPS.length - 2);
  const from = STOPS[i]!;
  const to = STOPS[i + 1]!;
  const k = t - i;
  return [0, 1, 2].map((c) => Math.round(from[c]! + (to[c]! - from[c]!) * k)) as [
    number,
    number,
    number,
  ];
}

export function yearCss(fraction: number) {
  const [r, g, b] = yearRgb(fraction);
  return `rgb(${r}, ${g}, ${b})`;
}

export const rampGradient = `linear-gradient(to right, ${STOPS.map(
  ([r, g, b]) => `rgb(${r}, ${g}, ${b})`,
).join(", ")})`;
