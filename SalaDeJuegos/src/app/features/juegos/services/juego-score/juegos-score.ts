import { Injectable } from '@angular/core';
import { Supabase } from '../../../../core/services/supabase/supabase';
import { ResultadoAhorcado } from '../../models/resultado-juego';

@Injectable({
  providedIn: 'root',
})
export class JuegosScore {
  constructor(private supabase: Supabase) {}

  guardarResultadoAhorcado(data: ResultadoAhorcado) {
    return this.supabase['client'].from('partidas_ahorcado').insert([
      {
        usuario_email: data.emailUsuario,
        dificultad: data.dificultad,
        palabra: data.palabra,
        tiempo_segundos: data.tiempoSegundos,
        letras_seleccionadas: data.letrasSeleccionadas,
        aciertos: data.aciertos,
        errores: data.errores,
        resultado: data.resultado,
        puntaje: data.puntaje,
        fecha_fin: data.fechaFinIso ?? new Date().toISOString(),
      },
    ]);
  }
}