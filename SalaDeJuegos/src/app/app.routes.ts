import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/no-auth/no-auth-guard';
import { authGuard } from './core/guards/auth/auth-guard';

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
    {
        path: "guia",
        loadComponent: () => import('./features/guia-juegos/guia-juegos').then((m) => m.GuiaJuegos)
    },
    {
        path: "juegos",
        loadChildren: () => import('./features/juegos/juegos-module').then((m) => m.JuegosModule),
    },
    { path: "**", redirectTo: "log-in" }
];
