import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth/auth';
import { GaleriaJuegosDisponibles } from '../../shared/components/galeria-juegos-disponibles/galeria-juegos-disponibles';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [GaleriaJuegosDisponibles, RouterLink, SidebarMenu],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected auth = inject(Auth);
  private router = inject(Router);

  bloqueoInvitadoVisible = false;

  async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigate(['/log-in']);
  }

  async onIntentarJugar(juego: { rutaJuego?: string }): Promise<void> {
    if (!this.auth.usuario()) {
      this.bloqueoInvitadoVisible = true;
      return;
    }

    if (juego.rutaJuego) {
      await this.router.navigate([juego.rutaJuego]);
    }
  }

  onChatClickSinAuth(): void {
    this.bloqueoInvitadoVisible = true;
  }
}