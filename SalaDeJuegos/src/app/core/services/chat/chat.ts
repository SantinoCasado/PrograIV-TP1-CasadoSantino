import { Injectable, signal } from '@angular/core';
import { Supabase } from '../supabase/supabase';
import { Auth } from '../auth/auth';
import { MensajeChat } from '../../models/mensaje-chat';
import type { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  readonly mensajes = signal<MensajeChat[]>([]); // Signal que almacena los mensajes del chat

  supabase: Supabase;
  auth: Auth;

  constructor(supabase: Supabase, auth: Auth) {
    this.supabase = supabase;
    this.auth = auth;
  }

  // Consulta a la tabla 'mensajes_chat' ordenao por created_at descendente para mostrar los mensajes más recientes primero
  async obtenerMensajes() {
    const { data, error } = await this.supabase
      .getClient()
      .from('mensajes_chat')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error('Error al obtener mensajes:', error);
    if (data) this.mensajes.set(data as MensajeChat[]);
    return { data, error };
  }

  async enviarMensaje(contenido: string) {
    const usuario = this.auth.usuario();
    const perfil = this.auth.perfil();

    //Valido si no hay usuario no se inserta
    if (!usuario) return { data: null, error: 'Usuario no autenticado' };

    // Usar nombre del perfil si existe, sino usar el email
    const userName = perfil?.nombre ?? usuario.email?.split('@')[0] ?? 'Usuario';

    const { data, error } = await this.supabase
      .getClient()
      .from('mensajes_chat')
      .insert([
        {
          user_id: usuario.id,
          user_email: usuario.email ?? '',
          user_name: userName,
          user_message: contenido,
        },
      ]);
    return { data, error };
  }

  // La suscripción que permite escuchar en tiempo real los nuevos mensajes insertados en la tabla 'mensajes_chat' y actualizar automáticamente el signal
  suscribirseMensajes() {
    const subscription = this.supabase
      .getClient()
      .channel('public:mensajes_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat' },
        (payload: RealtimePostgresInsertPayload<{ [key: string]: any }>) => {
          this.mensajes.update((msgs) => [...msgs, payload.new as MensajeChat]);
        }
      )
      .subscribe();

    return subscription;
  }

  cancelarSuscripcion(subscription: RealtimeChannel) {
    return this.supabase.getClient().removeChannel(subscription);
  }
}
