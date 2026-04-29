import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PerfilUsuario } from '../../models/perfil-usuario';

@Injectable({
  providedIn: 'root',
})

export class Supabase {
  private SUPABASE_URL = 'https://vjtvmyoduvbfrnhgtker.supabase.co';
  private SUPABASE_KEY = 'sb_publishable_QWvLLqZBo-EU4-b2QbHThQ_AvNz_lX5';
  private client: SupabaseClient;
  
  constructor() {
    this.client = createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
  }

  registrar(email:string, contraseña:string){
    return this.client.auth.signUp({
      email: email,
      password: contraseña
    });
  }

  iniciarSesion(email:string, contraseña:string){
    return this.client.auth.signInWithPassword({
      email: email,
      password: contraseña
    });
  }

  cerrarSesion(){
    return this.client.auth.signOut();
  }

  guardarPerfil(perfil: PerfilUsuario) {
    return this.client.from('usuariosTabla').insert([perfil]);
  }

  obtenerPerfil(email: string) {
    return this.client.from('usuariosTabla').select('*').eq('email', email).single();
  }

  obtenerPerfilPorEmail(email: string) {
    return this.client.from('usuariosTabla').select('*').eq('email', email).single();
  }
}
