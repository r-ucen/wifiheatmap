export interface HeatmapPoint {
  x: number;
  y: number;
  rssi: number;
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export interface SavedMeasurement {
  id: number;
  name: string;
  date: number;
  heatmapPoints: HeatmapPoint[];
}

export interface AppSettings {
  scanActiveIntervalMs: number;
  scanPassiveIntervalMs: number;
  stepSize: number;
  heatmapRadius: number;
  heatmapBlur: number;
  zoomPadding: number;
  renderUserPath: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  scanActiveIntervalMs: 4000,
  scanPassiveIntervalMs: 1000,
  stepSize: 4,
  heatmapRadius: 10,
  heatmapBlur: 10,
  zoomPadding: 0.9,
  renderUserPath: true,
};
