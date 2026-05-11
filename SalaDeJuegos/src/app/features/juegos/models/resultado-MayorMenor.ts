export type ResultadoPartidaMayorMenor = 'ganada' | 'perdida' | 'abandonada';

export interface ResultadoMayorMenor {
  emailUsuario: string;
  deckId: string;
  cartasAcertadas: number;
  jugadasTotales: number;
  tiempoSegundos: number;
  resultado: ResultadoPartidaMayorMenor;
  puntaje: number;
  fechaFinIso?: string;
}