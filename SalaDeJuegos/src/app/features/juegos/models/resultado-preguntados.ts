export type ResultadoPartidaPreguntados = 'ganada' | 'perdida' | 'abandonada';
export type ModoJuegoPreguntados = 'banderas' | 'pokemon';

export interface ResultadoPreguntados {
  emailUsuario: string;
  modo: ModoJuegoPreguntados;
  aciertos: number;
  errores: number;
  preguntasTotales: number;
  tiempoSegundos: number;
  resultado: ResultadoPartidaPreguntados;
  puntaje: number;
  fechaFinIso?: string;
}
