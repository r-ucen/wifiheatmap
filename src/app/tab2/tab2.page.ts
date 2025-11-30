import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { OverlayEventDetail } from '@ionic/core';
import { StorageService } from '../services/storage.service';
import { FormsModule } from '@angular/forms';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  HeatmapPoint,
  SavedMeasurement,
} from '../models/app.model';
import { HeatmapRenderer } from '../utils/heatmap-renderer';
import { Subscription } from 'rxjs';
import { SettingsService } from '../services/settings.service';
import { AsyncPipe } from '@angular/common';

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
    AsyncPipe,
  ],
})
export class Tab2Page {
  @ViewChild('savedHeatmapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('savedHeatmapCanvasWrapper') wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild(IonModal) modal!: IonModal;

  measurementToEdit: SavedMeasurement | null = null;
  settings: AppSettings = DEFAULT_SETTINGS;

  private renderer!: HeatmapRenderer;
  private settingsSub!: Subscription;

  constructor(
    public storageService: StorageService,
    private settingsService: SettingsService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.settingsSub = this.settingsService.settings$.subscribe(
      (newSettings) => {
        this.settings = newSettings;
      },
    );
  }

  ionViewWillEnter() {
    this.storageService.loadMeasurements();
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
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

  // heatmap

  initCanvas() {
    if (!this.canvasRef || !this.wrapperRef) return;

    const wrapper = this.wrapperRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new HeatmapRenderer(
      canvas,
      this.settings.heatmapRadius,
      this.settings.heatmapBlur,
    );

    this.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
  }

  render(points: HeatmapPoint[]) {
    requestAnimationFrame(() => {
      this.renderer?.render(points);
    });
  }

  // modal

  getMeasurementAndOpenModal(measurement: SavedMeasurement) {
    this.measurementToEdit = { ...measurement };
    this.modal.present();
  }

  onModalDidPresent() {
    this.initCanvas();
    if (this.measurementToEdit) {
      this.render(this.measurementToEdit.heatmapPoints);
    }
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
