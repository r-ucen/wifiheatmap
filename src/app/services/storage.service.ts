import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SavedMeasurement } from '../models/app.model';

@Injectable({
  providedIn: 'root',
})

export class StorageService {
  private KEY  = "wifi_heatmap_measurements"

  measurements: SavedMeasurement[] = [];

  constructor() {
    console.log("Storage service initialized");
  }

  async saveMeasurements() {
    await Preferences.set({ key: this.KEY, value: JSON.stringify(this.measurements) });
  }

  async loadMeasurements(): Promise<void> {
    const { value } = await Preferences.get({ key: this.KEY });
    this.measurements = value ? JSON.parse(value) : [];
  }

  async addMeasurement(measurement: SavedMeasurement) {
    this.measurements.unshift(measurement);
    await this.saveMeasurements();
  }

  async updateMeasurementName(id: number, newName: string) {
    const measurement = this.measurements.find(m => m.id === id);
    if (measurement) {
      measurement.name = newName;
      await this.saveMeasurements();
    }
  }

  async deleteMeasurement(id: number) {
    const m = this.measurements.filter(m => m.id !== id);
    if (m) {
      this.measurements = m;
      await this.saveMeasurements();
    }
  }
}
