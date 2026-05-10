export interface PartidaAbandonable {
  hayPartidaEnCurso: () => boolean;
  pedirConfirmacionAbandono: () => Promise<boolean>;
}