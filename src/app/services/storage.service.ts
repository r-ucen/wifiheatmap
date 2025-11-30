import { Injectable } from '@angular/core';
import { SavedMeasurement } from '../models/app.model';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private user: User | null = null;
  private measurementsSub?: Subscription;

  private measurementsSubject = new BehaviorSubject<SavedMeasurement[]>([]);
  measurements$ = this.measurementsSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;

      this.measurementsSub?.unsubscribe();
      this.measurementsSubject.next([]);

      if (user) {
        this.loadMeasurements();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async loadMeasurements(): Promise<void> {
    const colRef = collection(
      this.firestore,
      `users/${this.user?.uid}/measurements`,
    );
    collectionData(colRef, { idField: 'uuid' }).subscribe((data) => {
      this.measurementsSubject.next(data as SavedMeasurement[]);
    });
  }

  async addMeasurement(measurement: SavedMeasurement) {
    const docRef = doc(
      this.firestore,
      `users/${this.user?.uid}/measurements/${measurement.id}`,
    );
    await setDoc(docRef, measurement);
  }

  async updateMeasurementName(id: string, newName: string) {
    const docRef = doc(
      this.firestore,
      `users/${this.user?.uid}/measurements/${id}`,
    );
    await updateDoc(docRef, { name: newName });
  }

  async deleteMeasurement(id: string) {
    if (!this.user) return;
    const docRef = doc(
      this.firestore,
      `users/${this.user?.uid}/measurements/${id}`,
    );
    await deleteDoc(docRef);
  }
}
