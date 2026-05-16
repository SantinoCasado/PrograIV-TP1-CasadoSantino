import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth/auth';

function validarAutenticacion() {
  const auth = inject(Auth);
  const router = inject(Router);

  // Si sesión aún se está restaurando, permite navegación (el componente decidirá qué mostrar)
  // Si sesión ya se restauró pero no hay usuario, redirige al login
  if (!auth.sesionRestaurada()) {
    return true; // Permite la ruta, componente esperará sesión restaurada
  }

  return auth.usuario()
    ? true
    : router.parseUrl('/log-in?msg=requiere-login');
}

export const authGuard: CanActivateFn = () => validarAutenticacion();

export const authMatchGuard: CanMatchFn = () => validarAutenticacion();
