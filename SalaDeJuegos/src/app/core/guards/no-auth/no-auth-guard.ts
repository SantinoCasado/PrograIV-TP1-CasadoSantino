import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth/auth';

export const noAuthGuard: CanMatchFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.usuario()) {
    router.navigate(['/home']);
    return false; // Si el usuario ya está autenticado, redirige a Home y bloquea la navegación al login o registro.
  }
  
  return true;  // Si el usuario no está autenticado, permite la navegación al login o registro.
};
