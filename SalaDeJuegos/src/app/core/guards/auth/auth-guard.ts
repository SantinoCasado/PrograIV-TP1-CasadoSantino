import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../../services/auth/auth';

function esperarSesionRestaurada(auth: Auth, timeoutMs = 2500): Promise<void> {
  if (auth.sesionRestaurada()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const inicio = Date.now();

    const verificar = () => {
      if (auth.sesionRestaurada() || Date.now() - inicio >= timeoutMs) {
        resolve();
        return;
      }

      setTimeout(verificar, 50);
    };

    verificar();
  });
}

async function validarAutenticacion() {
  const auth = inject(Auth);
  const router = inject(Router);

  await esperarSesionRestaurada(auth);

  return auth.usuario()
    ? true
    : router.parseUrl('/log-in?msg=requiere-login');
}

export const authGuard: CanActivateFn = () => validarAutenticacion();

export const authMatchGuard: CanMatchFn = () => validarAutenticacion();
