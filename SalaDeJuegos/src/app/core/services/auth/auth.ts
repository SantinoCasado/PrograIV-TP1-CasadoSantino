import { Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Supabase } from '../supabase/supabase';
import { PerfilUsuario } from '../../models/perfil-usuario';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  // Signal que expone el estado de autenticación del usuario, inicialmente nulo (no autenticado)
  readonly usuario = signal<User | null>(null);

  // Signal con los datos del perfil (nombre, apellido, etc.) obtenidos de la BD
  readonly perfil = signal<PerfilUsuario | null>(null);

  constructor(private supabase: Supabase) {
    // Carga la sesion actual cuando la app arranca para mantener el estado de autenticación
    this.supabase.getSesion().then(({ data }) => {
      const user = data.session?.user ?? null;
      this.usuario.set(user);
      if (user?.email) this.cargarPerfil(user.email);
    });

    // Escucha cambios en el estado de autenticación (inicio/cierre de sesión) para actualizar la señal
    this.supabase.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      this.usuario.set(user);
      if (user?.email) {
        this.cargarPerfil(user.email);
      } else {
        this.perfil.set(null);
      }
    });
  }

  // Carga el perfil del usuario desde la BD y lo guarda en el signal
  private async cargarPerfil(email: string): Promise<void> {
    const { data } = await this.supabase.obtenerPerfilPorEmail(email);

    if (data) {
      this.perfil.set(data);
      return;
    }

    const user = this.usuario();
    const metadata = user?.user_metadata as
      | { nombre?: string; apellido?: string; edad?: number | string }
      | undefined;

    if (!user?.email || !metadata?.nombre || !metadata?.apellido) {
      this.perfil.set(null);
      return;
    }

    const perfilDesdeMetadata: PerfilUsuario = {
      email: user.email,
      nombre: metadata.nombre,
      apellido: metadata.apellido,
      edad: Number(metadata.edad ?? 0),
    };

    const { error } = await this.supabase.upsertPerfil(perfilDesdeMetadata);
    if (error) {
      this.perfil.set(null);
      return;
    }

    this.perfil.set(perfilDesdeMetadata);
  }

  async cerrarSesion() {
    await this.supabase.cerrarSesion();
    this.usuario.set(null);
    this.perfil.set(null);
  }
}
