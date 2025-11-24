import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonRow, IonLabel, IonButton, IonCol, IonFooter, Platform } from '@ionic/angular/standalone';
import { StorageService } from '../services/storage.service';
import { HeatmapPoint, Direction } from '../models/app.model';
import { CapacitorWifi } from 'capacitorjs-plugin-wifi';
import simpleheat from 'simpleheat';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonFooter, IonCol, IonLabel, IonRow, IonCard, IonHeader, IonToolbar, IonTitle, IonContent, IonCardContent, IonButton],
})
export class Tab1Page {

  @ViewChild('heatmapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>
  @ViewChild('canvasWrapper') wrapperRef!: ElementRef<HTMLElement>

  currentRssi: number = 0
  currentSsid: string | null = null;
  currentX: number = 0
  currentY: number = 0
  currentDirection: Direction = Direction.Up;
  heatmap: any
  heatmapPoints: HeatmapPoint[] = []
  isMeasuring: boolean = false
  private ctx: CanvasRenderingContext2D | null = null

  private signalInterval: any

  constructor(private storageService: StorageService, private platform: Platform) {}

  startMeasuring() {
    this.isMeasuring = true

    this.currentX = 0
    this.currentY = 0
    Direction.Up
    this.heatmapPoints = []

    this.updateWifiInfo()

    this.addPoint(0, 0, this.currentRssi)
    
    this.startSignalWatch(4000, true)
  }

  stopMeasuring() {
    this.isMeasuring = false
    this.stopSignalWatch()

    this.startSignalWatch(1000, false)
  }

  async checkAndRequestWifiPermissions() {
    try {
      const perm = await CapacitorWifi.checkPermission()
      if (!perm.status) {
        CapacitorWifi.requestPermission()
      }
    } catch (e) {
      console.log("no permission: ", e)
    }
  }

  async updateWifiInfo() {
    try {
      if (!await CapacitorWifi.getWifiStatus()) {
        this.currentRssi = 0
        this.currentSsid = "disconnected"
      }
      const wifiInfo = await CapacitorWifi.getCurrentNetworkConfiguration()

      if (wifiInfo) {
        this.currentRssi = wifiInfo.rssi
        this.currentSsid = wifiInfo.ssid ? wifiInfo.ssid.replace(/"/g, '') : "unknown"
      }
    } catch (e) {
      console.log("error getting wifi info:", e)
    }
  }
  
  turnLeft() {
    switch(this.currentDirection) {
      case Direction.Up:
        this.currentDirection = Direction.Left
        break;
      case Direction.Down:
        this.currentDirection = Direction.Right
        break;
      case Direction.Left:
        this.currentDirection = Direction.Down
        break;
      case Direction.Right:
        this.currentDirection = Direction.Up
    }
  }

  turnRight() {
    switch(this.currentDirection) {
      case Direction.Up:
        this.currentDirection = Direction.Right
        break;
      case Direction.Down:
        this.currentDirection = Direction.Left
        break;
      case Direction.Left:
        this.currentDirection = Direction.Up
        break;
      case Direction.Right:
        this.currentDirection = Direction.Down
    }
  }

  startSignalWatch(delay: number, recordPoints: boolean) {
    this.stopSignalWatch();
    
    this.signalInterval = setInterval(async () => {
      await this.updateWifiInfo();

      if (recordPoints) {
        switch (this.currentDirection) {
          case Direction.Up:
            this.currentY -= 4;
            break;
          case Direction.Down:
            this.currentY += 4;
            break;
          case Direction.Left:
            this.currentX -= 4;
            break;
          case Direction.Right:
            this.currentX += 4;
            break;
        }

        this.addPoint(this.currentX, this.currentY, this.currentRssi);
      }
      console.log(this)
    }, delay);
  }

  stopSignalWatch() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
    }
  }

  async ionViewDidEnter() {

    if (this.platform.is('capacitor')) {
      await this.checkAndRequestWifiPermissions()
      this.startSignalWatch(1000, false);
    } else {
      console.log("not mobile")
    }

    if (!this.canvasRef || !this.wrapperRef) {
      console.error("canvas or wrapper not found")
      return;
    }

    const canvas = this.canvasRef.nativeElement
    const wrapper = this.wrapperRef.nativeElement

    canvas.width = wrapper.clientWidth
    canvas.height = wrapper.clientHeight
    
    this.ctx = canvas.getContext('2d')

    this.heatmap = simpleheat(canvas)
    this.heatmap.radius(10, 10)
    this.heatmap.max(100)
  }

  ionViewDidLeave() {
    this.stopSignalWatch();
  }

  addPoint(x: number, y: number, rssi: number) {
    this.heatmapPoints.push({ x, y, rssi })
    this.updateHeatmap()
  }

  updateHeatmap() {
    console.log(this.heatmapPoints)
    if (!this.heatmap || !this.ctx) return

    const canvas = this.canvasRef.nativeElement
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.ctx.save()

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of this.heatmapPoints) {
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
    }

    const dataWidth = maxX - minX
    const dataHeight = maxY - minY

    const scaleX = canvas.width / dataWidth
    const scaleY = canvas.height / dataHeight

    const scale = Math.min(scaleX, scaleY) * 0.9

    // center view
    this.ctx.translate(canvas.width / 2, canvas.height / 2)
    this.ctx.scale(scale, scale)
    // also center the data points, if i dont do that, only the first point will be centered
    this.ctx.translate(-(minX + dataWidth / 2), -(minY + dataHeight / 2))

    const data = this.heatmapPoints.map(p => [p.x, p.y, this.normalizeRssiValue(p.rssi)])
    
    this.heatmap.data(data)
    this.heatmap.draw()
    
    this.drawUserPath()

    this.ctx.restore()
  }

  drawUserPath() {
    if (!this.ctx) return

    if (this.heatmapPoints.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.heatmapPoints[0].x, this.heatmapPoints[0].y);
      for (let i = 1; i < this.heatmapPoints.length; i++) {
        this.ctx.lineTo(this.heatmapPoints[i].x, this.heatmapPoints[i].y);
      }
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 0.3;
      this.ctx.stroke();
    }
    
    for (let i = 0; i < this.heatmapPoints.length; i++) {
      this.ctx.beginPath()
      if (i == this.heatmapPoints.length - 1){
        this.ctx.arc(this.heatmapPoints[i].x, this.heatmapPoints[i].y, 0.7, 0, 2 * Math.PI)
        this.ctx.fillStyle = 'white'
      } else {
        this.ctx.arc(this.heatmapPoints[i].x, this.heatmapPoints[i].y, 0.4, 0, 2 * Math.PI)
        this.ctx.fillStyle = 'black'
      }
      this.ctx.fill()
    }
  }

  normalizeRssiValue(val: number) {
    let normalized = val + 100
    if (normalized < 0) normalized = 0
    return normalized
  }
}