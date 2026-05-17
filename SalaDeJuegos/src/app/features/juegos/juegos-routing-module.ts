import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Ahorcado } from './pages/ahorcado/ahorcado';
import { BuscaMinas } from './pages/busca-minas/busca-minas';
import { MayorMenor } from './pages/mayor-menor/mayor-menor';
import { Preguntados } from './pages/preguntados/preguntados';
import { authGuard } from '../../core/guards/auth/auth-guard';
import { partidaAbandonoGuard } from '../../core/guards/partida/partida-abandono-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'ahorcado',
    pathMatch: 'full',
  },
  {
    path: 'ahorcado',
    component: Ahorcado,
    canActivate: [authGuard],
    canDeactivate: [partidaAbandonoGuard],
  },
  {
    path: 'busca-minas',
    component: BuscaMinas,
    canActivate: [authGuard],
    canDeactivate: [partidaAbandonoGuard],
  },
  {
    path: 'mayor-menor',
    component: MayorMenor,
    canActivate: [authGuard],
    canDeactivate: [partidaAbandonoGuard],
  },
  {
    path: 'preguntados',
    component: Preguntados,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuegosRoutingModule {}