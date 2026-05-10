export type DificultadAhorcado = "facil" | "medio" | "dificil";
export type ResultadoPartidaAhorcado = "ganada" | "perdida" | "abandonada";

export interface ResultadoAhorcado {
    emailUsuario: string;
    dificultad: DificultadAhorcado;
    palabra: string;
    tiempoSegundos: number;
    letrasSeleccionadas: number;
    aciertos: number;
    errores: number;
    resultado: ResultadoPartidaAhorcado;
    puntaje: number;
    fechaFinIso?: string;
}