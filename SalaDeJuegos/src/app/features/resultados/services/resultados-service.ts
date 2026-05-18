import { inject, Injectable } from '@angular/core';
import { RealtimeChannel  } from '@supabase/supabase-js';
import { Supabase } from '../../../core/services/supabase/supabase';
import { FilaRankingJuego, FilaRankingGlobal } from '../models/filas-tablas';
import { from } from 'rxjs';

export type JuegoKey = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'busca-minas';

@Injectable({
  providedIn: 'root',
})

export class ResultadosService {
  // ---------- PROPIEDADES ---------
  private cliente = inject(Supabase).getClient(); // Obtener el cliente de Supabase
  private canal: RealtimeChannel | null = null; // Para almacenar la referencia al canal de suscripción

  // ---------- GETTERS ----------
  getTopPorJuego(juego: JuegoKey, limit = 25) {
    return this.cliente
      .from('v_mejor_puntaje_por_juego')
      .select('juego, usuario_email, mejor_puntaje, posicion')
      .eq('juego', juego) // Filtrar por el juego específico
      .order('mejor_puntaje', { ascending: false }) // Ordenar por puntaje descendente
      .limit(limit); // Limitar la cantidad de resultados
  }

  getPosicionUsuario(juego: JuegoKey, emailUsuario: string) {
    return this.cliente
          .from('v_mejor_puntaje_por_juego')
          .select('juego, usuario_email, mejor_puntaje, posicion')
          .eq('juego', juego)
          .eq('usuario_email', emailUsuario)
          .maybeSingle();
  }

  getTopGlobal(limit = 50) {
    return this.cliente
      .from('v_ranking_global')
      .select('usuario_email, total_puntos, posicion')
      .order('total_puntos', { ascending: false })
      .limit(limit);
  }

  getPosicionGlobalUsuario(email: string) {
    return this.cliente
      .from('v_ranking_global')
      .select('usuario_email, total_puntos, posicion')
      .eq('usuario_email', email)
      .maybeSingle();
  }

  // ---------- SUSCRIPCIÓN EN TIEMPO REAL ----------
  startRealtime(onChange: () => void) {
    if (this.canal) return; // Evitar múltiples suscripciones

    // Suscribirse a cambios en las tablas relevantes para los resultados
    this.canal = this.cliente 
      .channel('resultados-live') // Nombre del canal (puede ser cualquier string único)
      .on(                        // Escuchar cambios en la vista de ranking global
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ranking_global_usuarios' },
        onChange
      )
      .on(                        // Escuchar cambios en la vista de resultados de ahorcado
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidas_ahorcado' },
        onChange
      )
      .on(                        // Escuchar cambios en la vista de resultados de mayor-menor
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidas_mayor_menor' },
        onChange
      )
      .on(                        // Escuchar cambios en la vista de resultados de preguntados
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidas_preguntados' },
        onChange
      )
      .on(            // Escuchar cambios en la vista de resultados de busca-minas
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partidas_busca_minas' },
        onChange
      )
      .subscribe();
  }

  stopRealtime() {
    if (!this.canal) return;
    this.cliente.removeChannel(this.canal);
    this.canal = null;
  }
}
