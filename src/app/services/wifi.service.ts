import { Injectable } from '@angular/core';
import { CapacitorWifi } from 'capacitorjs-plugin-wifi';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class WifiService {
  
  constructor(private platform: Platform) {}

  async checkPermissions(): Promise<boolean> {
    if (!this.platform.is('capacitor')) {
      return true
    }

    try {
      const { status } = await CapacitorWifi.checkPermission();
      if (status) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log("permission error: ", e)
      return false
    }
  }

  async getWifiInfo(): Promise<{ rssi: number, ssid: string }> {
    if (!this.platform.is('capacitor')) {
      return { rssi: Math.floor(Math.random() * 100) - 100, ssid: "simulated wifi" }
    }

    try {
      const networkConfig = await CapacitorWifi.getCurrentNetworkConfiguration()
      return {
        rssi: networkConfig.rssi,
        ssid: networkConfig.ssid ? networkConfig.ssid.replace(/"/g, '') : "unknown"
      }
    } catch (e) {
      console.log("error getting wifi info:", e)
      return { rssi: 0, ssid: 'disconnected' };
    }
  }
}

