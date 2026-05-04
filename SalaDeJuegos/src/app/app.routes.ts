import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/no-auth-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: "",
        pathMatch: "full",
        redirectTo: "log-in"
    },
    {
        path: "log-in",
        canMatch: [noAuthGuard],
        loadComponent: () => import('./features/auth/pages/log-in/log-in').then((m) => m.LogIn)
    },
    {
        path: "registro",
        canMatch: [noAuthGuard],
        loadComponent: () => import('./features/auth/pages/registro/registro').then((m) => m.Registro)
    },
    {
        path: "home",
        loadComponent: () => import('./features/home/home').then((m) => m.Home)
    },
    {
        path: "about-me",
        loadComponent: () => import('./features/quien-soy/quien-soy').then((m) => m.QuienSoy)
    },
    { path: "**", redirectTo: "log-in" }
];
