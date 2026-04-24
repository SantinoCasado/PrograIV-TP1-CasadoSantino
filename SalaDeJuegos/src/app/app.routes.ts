import { Routes } from '@angular/router';
import { Bienvenida } from './features/bienvenida/bienvenida';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () =>
            import('./features/bienvenida/bienvenida').then((m) => m.Bienvenida),
        children: [
            {
                path: "", pathMatch: "full", redirectTo: "log-in"
            },
            {
                path: "log-in", 
                loadComponent: () => import('./features/auth/pages/log-in/log-in').then((m) => m.LogIn)
            },
            {
                path: "registro",
                loadComponent: () => import('./features/auth/pages/registro/registro').then((m) => m.Registro)
            },
        ],
    },
    {
        path: "about-me",
        loadComponent: () =>
            import('./features/quien-soy/quien-soy').then((m) => m.QuienSoy)
    },
    {path: "**", redirectTo: ""}
];
