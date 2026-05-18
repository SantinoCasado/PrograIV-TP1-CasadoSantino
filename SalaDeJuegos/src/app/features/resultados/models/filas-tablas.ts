export type JuegoKey = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'busca-minas';

export interface FilaRankingJuego {
  juego: JuegoKey;
  usuario_email: string;
  mejor_puntaje: number;
  posicion: number;
}

export interface FilaRankingGlobal {
  usuario_email: string;
  total_puntos: number;
  posicion: number;
}