import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth/auth';

function validarAutenticacion() {
  const auth = inject(Auth);
  const router = inject(Router);

  // Si el usuario está autenticado, permite la navegación. Si no, redirige al login con un mensaje indicando que se requiere autenticación.
  return auth.usuario()
    ? true
    : router.parseUrl('/log-in?msg=requiere-login');
}

export const authGuard: CanActivateFn = () => validarAutenticacion();

export const authMatchGuard: CanMatchFn = () => validarAutenticacion();
