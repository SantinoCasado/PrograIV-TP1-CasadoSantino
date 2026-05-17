import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth/auth';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

type JuegoGuia = 'mayor-menor' | 'ahorcado' | 'busca-minas' | 'preguntados';

interface GuiaItem {
  texto: string;
  subItems?: string[];
}

interface GuiaNota {
  tipo?: string;
  icono?: string;
  texto: string;
}

interface GuiaSeccion {
  titulo: string;
  icono: string;
  parrafos?: string[];
  pasos?: string[];
  listaClase?: string;
  items?: GuiaItem[];
  formula?: string;
  nota?: GuiaNota;
}

interface GuiaJuego {
  titulo: string;
  descripcion: string;
  icono: string;
  secciones: GuiaSeccion[];
}

type GuiaDiccionario = Record<JuegoGuia, GuiaJuego>;

@Component({
  selector: 'app-guia-juegos',
  standalone: true,
  imports: [CommonModule, SidebarMenu, RouterLink],
  templateUrl: './guia-juegos.html',
  styleUrl: './guia-juegos.css',
})
export class GuiaJuegos {
  protected auth = inject(Auth);
  private readonly http = inject(HttpClient);

  readonly juegoActual = signal<JuegoGuia>('mayor-menor');
  readonly bloqueoInvitadoVisible = signal(false);
  readonly cargandoGuia = signal(true);
  readonly errorGuia = signal(false);
  readonly guiaDiccionario = signal<GuiaDiccionario | null>(null);

  readonly juegos: JuegoGuia[] = ['mayor-menor', 'ahorcado', 'busca-minas', 'preguntados'];
  readonly guiaActual = computed(() => this.guiaDiccionario()?.[this.juegoActual()] ?? null);

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const juego = params.get('juego') as JuegoGuia;

    if (juego && this.juegos.includes(juego)) {
      this.juegoActual.set(juego);
    }

    this.cargarGuia();
  }

  cambiarJuego(juego: JuegoGuia): void {
    this.juegoActual.set(juego);
  }

  obtenerGuiaJuego(juego: JuegoGuia): GuiaJuego | null {
    return this.guiaDiccionario()?.[juego] ?? null;
  }

  onChatClickSinAuth(): void {
    this.bloqueoInvitadoVisible.set(true);
  }

  private cargarGuia(): void {
    this.cargandoGuia.set(true);
    this.errorGuia.set(false);

    this.http.get<GuiaDiccionario>('assets/data/guia-juegos.json').subscribe({
      next: (data) => {
        this.guiaDiccionario.set(data);
        this.cargandoGuia.set(false);
      },
      error: (err) => {
        console.error('[GUIA-JUEGOS] Error cargando guia-juegos.json:', err);
        this.errorGuia.set(true);
        this.cargandoGuia.set(false);
      },
    });
  }
}
