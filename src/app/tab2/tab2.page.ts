import { Component, ViewChild } from '@angular/core';
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
  IonModal,
  IonButtons,
  IonInput,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { OverlayEventDetail } from '@ionic/core';
import { StorageService } from '../services/storage.service';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeCall } from '@angular/compiler';
import { SavedMeasurement } from '../models/app.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonButtons,
    IonModal,
    IonInput,
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
  @ViewChild(IonModal) modal!: IonModal;

  measurementToEdit: SavedMeasurement | null = null;

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

  // modal

  getMeasurementAndOpenModal(measurement: SavedMeasurement) {
    this.measurementToEdit = { ...measurement };
    this.modal.present();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.measurementToEdit) {
      this.storageService.updateMeasurementName(
        this.measurementToEdit.id,
        this.measurementToEdit.name,
      );
      this.modal.dismiss(this.measurementToEdit.name, 'confirm');
    }
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    this.measurementToEdit = null;
  }
}
