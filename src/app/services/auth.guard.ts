import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async (state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });

  if (user) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url || '/tabs/tab1' },
  });
};
