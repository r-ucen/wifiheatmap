import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonLabel,
  IonItem,
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { OverlayEventDetail } from '@ionic/core';
import { StorageService } from '../services/storage.service';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonItem,
    IonLabel,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    FormsModule,
  ],
})
export class Tab2Page {
  constructor(
    public storageService: StorageService,
    private alertController: AlertController,
  ) {}

  ionViewWillEnter() {
    this.storageService.loadMeasurements();
  }

  async confirmDelete(id: string, name: string) {
    const alert = await this.alertController.create({
      header: `Do you want to delete: "${name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => {
            this.storageService.deleteMeasurement(id);
          },
        },
      ],
    });

    await alert.present();
  }
}
