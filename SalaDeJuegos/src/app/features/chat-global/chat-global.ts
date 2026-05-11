import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chat } from '../../core/services/chat/chat';
import { Auth } from '../../core/services/auth/auth';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-chat-global',
  standalone: true,
  imports: [SidebarMenu, RouterLink, CommonModule],
  templateUrl: './chat-global.html',
  styleUrl: './chat-global.css',
})
export class ChatGlobal {
  protected readonly chat = inject(Chat);
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly textoMensaje = signal<string>('');
  readonly enviando = signal<boolean>(false);
  readonly bloqueoNoLogueoVisible = signal<boolean>(false);
  private subscription: RealtimeChannel | null = null;
  private ultimoTotalMensajes = 0;

  constructor() {    // Validar si el usuario está loguado al inicializar
    if (!this.auth.usuario()) {
      this.bloqueoNoLogueoVisible.set(true);
    }
    // Reacciona al cambio de mensajes y hace scroll al final 
    effect(() => {
      const total = this.chat.mensajes().length;

      if (total > this.ultimoTotalMensajes) {
        requestAnimationFrame(() => {
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        });
      }

      this.ultimoTotalMensajes = total;
    });
  }

  ngOnInit(): void {
    if (this.auth.usuario()) {
      this.chat.obtenerMensajes();
      this.subscription = this.chat.suscribirseMensajes();
    }
  }

  actualizarTexto(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.textoMensaje.set(target?.value ?? '');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    void this.enviarMensaje();
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigate(['/log-in']);
  }

  async enviarMensaje(): Promise<void> {
    if (this.enviando()) return;  // Evita envíos múltiples si ya se está enviando un mensaje

    const contenidoLimpio = this.textoMensaje().trim();
    if (!contenidoLimpio) return;

    this.enviando.set(true);

    try {
      const { error } = await this.chat.enviarMensaje(contenidoLimpio);
      if (error) {
        console.error('Error al enviar mensaje:', error);
        return;
      }

      this.textoMensaje.set('');
    } catch (err) {
      console.error('Error inesperado al enviar mensaje:', err);
    } finally {
      this.enviando.set(false);
    }
  }

  esMensajePropio(userIdMensaje: string): boolean {
    return this.auth.usuario()?.id === userIdMensaje;
  }

  formatearHora(isoFecha: string): string {
    const fecha = new Date(isoFecha);
    if (Number.isNaN(fecha.getTime())) return '--:--';

    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.chat.cancelarSuscripcion(this.subscription);
      this.subscription = null;
    }
  }
}