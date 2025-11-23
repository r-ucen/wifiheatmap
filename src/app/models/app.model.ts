
export interface HeatmapPoint {
    x: number;
    y: number;
    rssi: number;
    timestamp: number;
}

export interface UserLocationPoint {
    x: number;
    y: number;
    timestamp: number;
}

export interface SavedMeasurement {
    id: number;
    name: string;
    date: number;
    points: HeatmapPoint[];
}

export interface AppSettings {
    stepIntervalMs: number;
}