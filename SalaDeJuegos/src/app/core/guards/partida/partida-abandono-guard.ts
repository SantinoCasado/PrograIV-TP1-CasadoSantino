import { CanDeactivateFn } from '@angular/router';
import { PartidaAbandonable } from '../../interfaces/partida-abandonable';

export const partidaAbandonoGuard: CanDeactivateFn<PartidaAbandonable> = (component) => {
  if (!component.hayPartidaEnCurso()) return true;
  return component.pedirConfirmacionAbandono();
};