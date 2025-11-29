import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonRow,
  IonLabel,
  IonButton,
  IonCol,
  IonFooter, IonModal, IonButtons, IonInput, IonItem } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.service';
import {
  HeatmapPoint,
  Direction,
  AppSettings,
  DEFAULT_SETTINGS,
  SavedMeasurement,
} from '../models/app.model';
import { SettingsService } from '../services/settings.service';
import { Subscription, timer, switchMap, tap, filter } from 'rxjs';
import { WifiService } from '../services/wifi.service';
import { HeatmapRenderer } from '../utils/heatmap-renderer';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonItem, IonInput, IonButtons, IonModal, 
    IonFooter,
    IonCol,
    IonLabel,
    IonRow,
    IonCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCardContent,
    IonButton,
    FormsModule
  ],
})
export class Tab1Page implements OnInit, OnDestroy {
  @ViewChild('heatmapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper') wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild(IonModal) modal!: IonModal;

  currentRssi: number = 0;
  currentSsid: string | null = null;
  currentX: number = 0;
  currentY: number = 0;
  currentDirection: Direction = Direction.Up;
  heatmapPoints: HeatmapPoint[] = [];
  isMeasuring: boolean = false;
  settings: AppSettings = DEFAULT_SETTINGS;

  savedMeasurement: SavedMeasurement = {
    id: '',
    name: '',
    date: '',
    heatmapPoints: []
  };

  private renderer!: HeatmapRenderer;
  private settingsSub!: Subscription;
  private scanSub!: Subscription;

  constructor(
    private storageService: StorageService,
    private settingsService: SettingsService,
    private wifiService: WifiService,
  ) {}

  ngOnInit() {
    this.settingsSub = this.settingsService.settings$.subscribe(
      (newSettings) => {
        this.settings = newSettings;
      },
    );
  }

  async ionViewDidEnter() {
    await this.wifiService.checkPermissions();
    this.initCanvas();
    this.startScanning(false);
  }

  ionViewDidLeave() {
    this.stopScanning();
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.stopScanning();
  }

  startMeasuring() {
    this.isMeasuring = true;

    this.currentX = 0;
    this.currentY = 0;
    this.currentDirection = Direction.Up;
    this.heatmapPoints = [];

    this.measure();

    this.startScanning(true);
  }

  stopMeasuring() {
    this.isMeasuring = false;

    this.startScanning(false);
  }

  turnLeft() {
    switch (this.currentDirection) {
      case Direction.Up:
        this.currentDirection = Direction.Left;
        break;
      case Direction.Down:
        this.currentDirection = Direction.Right;
        break;
      case Direction.Left:
        this.currentDirection = Direction.Down;
        break;
      case Direction.Right:
        this.currentDirection = Direction.Up;
        break;
    }
  }

  turnRight() {
    switch (this.currentDirection) {
      case Direction.Up:
        this.currentDirection = Direction.Right;
        break;
      case Direction.Down:
        this.currentDirection = Direction.Left;
        break;
      case Direction.Left:
        this.currentDirection = Direction.Up;
        break;
      case Direction.Right:
        this.currentDirection = Direction.Down;
        break;
    }
  }

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

  startScanning(measure: boolean) {
    this.scanSub?.unsubscribe();

    const interval = measure
      ? this.settings.scanActiveIntervalMs
      : this.settings.scanPassiveIntervalMs;

    this.scanSub = timer(0, interval)
      .pipe(
        switchMap(() => this.wifiService.getWifiInfo()),
        tap((data) => {
          this.currentRssi = data.rssi;
          this.currentSsid = data.ssid;
        }),
        filter(() => measure && this.isMeasuring),
      )
      .subscribe(() => this.moveAndMeasure());
  }

  stopScanning() {
    this.isMeasuring = false;
    this.scanSub?.unsubscribe();
  }

  move() {
    switch (this.currentDirection) {
      case Direction.Up:
        this.currentY -= this.settings.stepSize;
        break;
      case Direction.Down:
        this.currentY += this.settings.stepSize;
        break;
      case Direction.Left:
        this.currentX -= this.settings.stepSize;
        break;
      case Direction.Right:
        this.currentX += this.settings.stepSize;
        break;
    }
  }

  measure() {
    this.heatmapPoints.push({
      x: this.currentX,
      y: this.currentY,
      rssi: this.currentRssi,
    });
  }

  moveAndMeasure() {
    this.move();
    this.measure();

    this.render();
  }

  render() {
    requestAnimationFrame(() => {
      this.renderer?.render(this.heatmapPoints);
    });
  }

  // modal

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.savedMeasurement.name, 'confirm');
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.savedMeasurement.id = uuidv4();
      this.savedMeasurement.name = event.detail.data;
      this.savedMeasurement.date = new Date().toLocaleString("en-GB", {timeZone: "Europe/London"});
      this.savedMeasurement.heatmapPoints = this.heatmapPoints;

      this.storageService.addMeasurement(this.savedMeasurement);
      this.savedMeasurement.name = '';
    }
  }
}
