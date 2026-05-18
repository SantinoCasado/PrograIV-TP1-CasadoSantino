import { Injectable } from '@angular/core';
import { Supabase } from '../../../../core/services/supabase/supabase';
import { ResultadoAhorcado} from '../../models/resultado-ahorcado';
import { ResultadoMayorMenor } from '../../models/resultado-MayorMenor';
import { ResultadoPreguntados } from '../../models/resultado-preguntados';
import { ResultadoBuscaMinas } from '../../models/resultado-busca-minas';

@Injectable({
  providedIn: 'root',
})
export class JuegosScore {
  constructor(private supabase: Supabase) {}

  guardarResultadoAhorcado(data: ResultadoAhorcado) {
    return this.supabase.client.from('partidas_ahorcado').insert([
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

  guardarResultadoMayorMenor(data: ResultadoMayorMenor) {
    return this.supabase.client.from('partidas_mayor_menor').insert([
      {
        usuario_email: data.emailUsuario,
        deck_id: data.deckId,
        cartas_acertadas: data.cartasAcertadas,
        jugadas_totales: data.jugadasTotales,
        tiempo_segundos: data.tiempoSegundos,
        resultado: data.resultado,
        puntaje: data.puntaje,
        fecha_fin: data.fechaFinIso ?? new Date().toISOString(),
      },
    ]);
  }

  guardarResultadoPreguntados(data: ResultadoPreguntados) {
    return this.supabase.client.from('partidas_preguntados').insert([
      {
        usuario_email: data.emailUsuario,
        modo: data.modo,
        aciertos: data.aciertos,
        errores: data.errores,
        preguntas_totales: data.preguntasTotales,
        tiempo_segundos: data.tiempoSegundos,
        resultado: data.resultado,
        puntaje: data.puntaje,
        fecha_fin: data.fechaFinIso ?? new Date().toISOString(),
      },
    ]);
  }

  guardarResultadoBuscaMinas(data: ResultadoBuscaMinas) {
    return this.supabase.client.from('partidas_busca_minas').insert([
      {
        usuario_email: data.emailUsuario,
        dificultad: data.dificultad,
        puntaje: data.puntaje,
        resultado: data.resultado,
        fecha_fin: data.fechaFinIso ?? new Date().toISOString(),
      },
    ]);
  }
}