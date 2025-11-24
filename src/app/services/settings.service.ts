import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences'; 
import { AppSettings, DEFAULT_SETTINGS } from '../models/app.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private KEY = 'wifi_heatmap_settings'

  private settingsSubject = new BehaviorSubject<AppSettings>(DEFAULT_SETTINGS)

  settings$ = this.settingsSubject.asObservable()

  constructor() {
    this.loadSettings()
  }

  async loadSettings() {
    try {
      const { value } = await Preferences.get({ key: this.KEY })
      if (value) {
        const parsed = JSON.parse(value)
        this.settingsSubject.next({ ...DEFAULT_SETTINGS, ...parsed }) // emit a merged object of the two (overwritten by parsed)
      }
  
    } catch (e) {
      console.log("error loading settings: ", e)
    }
  }

  async updateSettings(newSettings: AppSettings) {
    this.settingsSubject.next(newSettings)

    await Preferences.set({
      key: this.KEY,
      value: JSON.stringify(newSettings)     
    })
  } 

  get currentSettings(): AppSettings { // no subscribing
    return this.settingsSubject.value;
  }

}
