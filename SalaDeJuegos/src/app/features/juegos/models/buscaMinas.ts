export type DificultadId = 'facil' | 'medio' | 'dificil' | 'experto';

export interface Dificultad {
    id: DificultadId;
    nombre: string;
    tamanio: number;
    minas: number;
    jackpot: number;
    tiempoObjetivoSeg: number;
}

export interface Celda {
    x: number;
    y: number;
    tieneMina: boolean;
    revelada: boolean;
    marcada: boolean;
    adyacentes: number;
    puntajeBanderaOtorgado: boolean;
    puntajeNumeroOtorgado: boolean;
}