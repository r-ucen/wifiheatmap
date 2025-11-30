import { Injectable, NgZone } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
} from '@angular/fire/auth';
import { authState } from 'rxfire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = authState(this.auth);

  constructor(
    private auth: Auth,
    private zone: NgZone,
  ) {}

  async signUp(email: string, password: string, displayName?: string) {
    this.zone.run(async () => {
      const cred = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    });
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async upgradeAnonymousToEmail(email: string, password: string) {
    const current = this.auth.currentUser;
    if (!current || !current.isAnonymous) return;
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(current, credential);
  }

  logout() {
    return signOut(this.auth);
  }
}
