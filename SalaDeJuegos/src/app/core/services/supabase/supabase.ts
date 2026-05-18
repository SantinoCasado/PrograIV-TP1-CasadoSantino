import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PerfilUsuario } from '../../models/perfil-usuario';

@Injectable({
  providedIn: 'root',
})

export class Supabase {
  private SUPABASE_URL = 'https://vjtvmyoduvbfrnhgtker.supabase.co';
  private SUPABASE_KEY = 'sb_publishable_QWvLLqZBo-EU4-b2QbHThQ_AvNz_lX5';
  private _client: SupabaseClient;

  constructor() {
    this._client = createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
  }

  public get client(): SupabaseClient {
    return this._client;
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // Método para registrar un nuevo usuario con email y contraseña utilizando Supabase
  registrar(
    email: string,
    contraseña: string,
    metadata?: { nombre?: string; apellido?: string; edad?: number }
  ) {
    const emailNormalizado = this.normalizarEmail(email);
    return this.client.auth.signUp({
      email: emailNormalizado,
      password: contraseña,
      options: {
        data: metadata,
      },
    });
  }

  // Método para iniciar sesión del usuario con email y contraseña utilizando Supabase
  iniciarSesion(email: string, contraseña: string) {
    const emailNormalizado = this.normalizarEmail(email);
    return this.client.auth.signInWithPassword({
      email: emailNormalizado,
      password: contraseña,
    });
  }

  // Método para cerrar sesión del usuario autenticado
  cerrarSesion() {
    return this.client.auth.signOut();
  }

  // Método para guardar el perfil de usuario en la base de datos después del registro exitoso
  guardarPerfil(perfil: PerfilUsuario) {
    return this.client.from('usuariosTabla').insert([
      {
        ...perfil,
        email: this.normalizarEmail(perfil.email),
      },
    ]);
  }

  upsertPerfil(perfil: PerfilUsuario) {
    return this.client.from('usuariosTabla').upsert(
      [
        {
          ...perfil,
          email: this.normalizarEmail(perfil.email),
        },
      ],
      { onConflict: 'email' }
    );
  }

  // Método para obtener el perfil de usuario por email, utilizado en la página "About Me"
  obtenerPerfil(email: string) {
    return this.client
      .from('usuariosTabla')
      .select('*')
      .eq('email', this.normalizarEmail(email))
      .maybeSingle();
  }

  // Método para obtener el perfil de usuario por email, utilizado en la página "About Me"
  obtenerPerfilPorEmail(email: string) {
    return this.client
      .from('usuariosTabla')
      .select('*')
      .eq('email', this.normalizarEmail(email))
      .maybeSingle();
  }

  // Método para obtener la sesión actual del usuario autenticado
  getSesion() {
    return this.client.auth.getSession();
  }

  // Método para escuchar cambios en el estado de autenticación (inicio/cierre de sesión)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.client.auth.onAuthStateChange(callback);
  }

  getClient() {
    return this.client;
  }
}
