export interface ResizeRiskMapEvent {
  resizeLeafletMap: boolean;
}

export interface ZoomRiskMapEvent {
  /** [south, west, north, east] */
  bounds: [number, number, number, number];
}
