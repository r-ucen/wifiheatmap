import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRange,
  IonLabel,
  IonItem,
  IonInput,
  IonList,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

import { AppSettings } from '../models/app.model';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonInput,
    IonItem,
    IonLabel,
    IonRange,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    FormsModule,
    IonList,
  ],
})
export class Tab3Page {
  settings: AppSettings;

  constructor(private settingsService: SettingsService) {
    this.settings = { ...this.settingsService.currentSettings };
  }

  onSettingsChange() {
    this.settingsService.updateSettings(this.settings);
  }
}
