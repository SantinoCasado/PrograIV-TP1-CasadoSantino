import { Injectable } from '@angular/core';
import { DificultadAhorcado } from '../../models/resultado-ahorcado';

@Injectable({
  providedIn: 'root',
})
export class AhorcadoState {

  private enCurso = false;
  private inicioMs = 0;
  private dificultad: DificultadAhorcado | null = null;
  private palabra = '';
  private letrasSeleccionadas = 0;
  private aciertos = 0;
  private errores = 0;

  get estadoPartida(): boolean {
    return this.enCurso;
  }
  get palabraActual(): string {
    return this.palabra;
  }
  get dificultadActual(): DificultadAhorcado | null {
    return this.dificultad;
  }
  get letrasSeleccionadasCount(): number {
    return this.letrasSeleccionadas;
  }
  get aciertosCount(): number {
    return this.aciertos;
  }
  get erroresCount(): number {
    return this.errores;
  }

  iniciarPartida(dificultad: DificultadAhorcado, palabra: string): boolean {
    if(this.enCurso) return false;

    this.enCurso = true;
    this.inicioMs = Date.now();
    this.dificultad = dificultad;
    this.palabra = palabra;
    this.letrasSeleccionadas = 0;
    this.aciertos = 0;
    this.errores = 0;
    return true;
  }

  registrarAcierto(): void {
    this.letrasSeleccionadas++;
    this.aciertos++;
  }

  registrarError(): void {
    this.letrasSeleccionadas++;
    this.errores++;
  }

  obtenerTiempoSegundos(): number {
    if (!this.enCurso) return 0;
    return Math.floor((Date.now() - this.inicioMs) / 1000);
  }

  finalizarPartida(): void {
    this.enCurso = false;
  }

  reiniciarTodo(): void {
    this.enCurso = false;
    this.inicioMs = 0;
    this.dificultad = null;
    this.palabra = '';
    this.letrasSeleccionadas = 0;
    this.aciertos = 0;
    this.errores = 0;
  }
}
