
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
    stepIntervalMs: number;
}