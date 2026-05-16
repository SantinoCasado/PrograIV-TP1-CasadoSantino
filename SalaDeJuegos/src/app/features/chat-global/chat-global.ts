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

  constructor() {
    // Reacciona cuando el usuario cambia (incluye carga inicial async de sesión)
    effect(() => {    // El effect se ejecutará cada vez que cambie el estado de autenticación del usuario
      const usuario = this.auth.usuario();
      if (usuario && !this.subscription) {  // Si hay un usuario autenticado y aún no estamos suscritos a los mensajes, procedemos
        this.bloqueoNoLogueoVisible.set(false); // Oculta el mensaje de bloqueo por no logueo
        this.chat.obtenerMensajes();  // Carga los mensajes actuales del chat
        this.subscription = this.chat.suscribirseMensajes();  // Establece la suscripción para recibir nuevos mensajes en tiempo real
      } else if (!usuario) {
        this.bloqueoNoLogueoVisible.set(true);  // Muestra el mensaje de bloqueo por no logueo si no hay usuario autenticado
      }
    });

    // Reacciona al cambio de mensajes y hace scroll al final 
    effect(() => {
      const total = this.chat.mensajes().length;  // Obtiene la cantidad total de mensajes actuales

      if (total > this.ultimoTotalMensajes) { // Si el total de mensajes ha aumentado desde la última vez que se verificó, hacemos scroll al final del contenedor de chat
        requestAnimationFrame(() => { // Use requestAnimationFrame para asegurarme de que el DOM se haya actualizado con el nuevo mensaje antes de intentar hacer scroll
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight; // Establece el scrollTop al scrollHeight para hacer scroll al final del contenedor
          }
        });
      }

      this.ultimoTotalMensajes = total;
    });
  }

  ngOnInit(): void {}

  actualizarTexto(event: Event): void { // Actualiza el estado del texto del mensaje a medida que el usuario escribe en el textarea
    const target = event.target as HTMLTextAreaElement | null;
    this.textoMensaje.set(target?.value ?? '');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    void this.enviarMensaje();
  }

  onMensajeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.enviarMensaje();
    }
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

  formatearFechaHora(isoFecha: string): string {
    const fecha = new Date(isoFecha);
    if (Number.isNaN(fecha.getTime())) return '--/--/---- --:--';

    const fechaTexto = fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${fechaTexto} ${this.formatearHora(isoFecha)}`;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.chat.cancelarSuscripcion(this.subscription);
      this.subscription = null;
    }
  }
}