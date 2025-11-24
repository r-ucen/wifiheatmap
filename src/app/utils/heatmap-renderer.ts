import simpleheat from 'simpleheat';
import { HeatmapPoint } from '../models/app.model';

export class HeatmapRenderer {
  private ctx: CanvasRenderingContext2D;
  private heat: any;

  constructor(
    private canvas: HTMLCanvasElement,
    radius: number,
    blur: number,
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.heat = simpleheat(canvas);
    this.heat.radius(radius, blur);
    this.heat.max(100);
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.heat.resize();
  }

  render(points: HeatmapPoint[]) {
    if (!points.length) {
      console.log('nothing to render');
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const dataWidth = maxX - minX;
    const dataHeight = maxY - minY;

    const scaleX = this.canvas.width / dataWidth;
    const scaleY = this.canvas.height / dataHeight;

    const scale = Math.min(scaleX, scaleY) * 0.9;

    console.table({
      minX,
      minY,
      maxX,
      maxY,
      dataWidth,
      dataHeight,
      scaleX,
      scaleY,
    });

    // center view
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(scale, scale);
    // also center the data points, if i dont do that, only the first point will be centered
    this.ctx.translate(-(minX + dataWidth / 2), -(minY + dataHeight / 2));

    const data = points.map((p) => [p.x, p.y, this.normalizeRssiValue(p.rssi)]);

    this.heat.data(data);
    this.heat.draw();

    this.drawUserPath(points);

    this.ctx.restore();
  }

  drawUserPath(points: HeatmapPoint[]) {
    if (!this.ctx) return;

    if (points.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 0.3;
      this.ctx.stroke();
    }

    for (let i = 0; i < points.length; i++) {
      this.ctx.beginPath();
      if (i == points.length - 1) {
        this.ctx.arc(points[i].x, points[i].y, 0.7, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'white';
      } else {
        this.ctx.arc(points[i].x, points[i].y, 0.4, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'black';
      }
      this.ctx.fill();
    }
  }

  normalizeRssiValue(val: number) {
    let normalized = val + 100;
    if (normalized < 0) normalized = 0;
    return normalized;
  }
}
