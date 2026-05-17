import { DificultadId } from './buscaMinas';

export type ResultadoPartidaBuscaMinas = 'ganada' | 'perdida' | 'abandonada';

export interface ResultadoBuscaMinas {
  emailUsuario: string;
  dificultad: DificultadId;
  puntaje: number;
  resultado: ResultadoPartidaBuscaMinas;
  fechaFinIso?: string;
}
