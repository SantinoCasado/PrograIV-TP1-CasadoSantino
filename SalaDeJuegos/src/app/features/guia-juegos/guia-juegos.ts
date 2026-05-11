import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../core/services/auth/auth';
import { SidebarMenu } from '../../shared/components/sidebar-menu/sidebar-menu';

type JuegoGuia = 'mayor-menor' | 'ahorcado' | 'busca-minas' | 'preguntados';

@Component({
  selector: 'app-guia-juegos',
  standalone: true,
  imports: [CommonModule, SidebarMenu, RouterLink],
  templateUrl: './guia-juegos.html',
  styleUrl: './guia-juegos.css',
})
export class GuiaJuegos {
  protected auth = inject(Auth);
  private router = inject(Router);

  // Signal para controlar qué sección de guía se está mostrando
  readonly juegoActual = signal<JuegoGuia>('mayor-menor');
  readonly bloqueoInvitadoVisible = signal(false);

  // Lista de juegos disponibles
  readonly juegos: JuegoGuia[] = ['mayor-menor', 'ahorcado', 'busca-minas', 'preguntados'];

  constructor() {
    // Obtener el juego del query param si existe
    const params = new URLSearchParams(window.location.search);
    const juego = params.get('juego') as JuegoGuia;

    if (juego && this.juegos.includes(juego)) {
      this.juegoActual.set(juego);
    }
  }

  cambiarJuego(juego: JuegoGuia): void {
    this.juegoActual.set(juego);
  }

  onChatClickSinAuth(): void {
    this.bloqueoInvitadoVisible.set(true);
  }

  // Obtiene el título del juego actual
  get tituloJuego(): string {
    const titulos: { [key in JuegoGuia]: string } = {
      'mayor-menor': 'Mayor o Menor',
      'ahorcado': 'Ahorcado',
      'busca-minas': 'Busca Minas',
      'preguntados': 'Preguntados',
    };
    return titulos[this.juegoActual()];
  }

  // Obtiene la descripción del juego actual para mostrar en la guía
  get descripcionJuego(): string {
    const descripciones: { [key in JuegoGuia]: string } = {
      'mayor-menor': 'Predice si la siguiente carta será mayor o menor que la actual',
      'ahorcado': 'Adivina la palabra antes de que se complete el dibujo del ahorcado',
      'busca-minas': 'Desactiva las minas sin hacer explotar ninguna',
      'preguntados': 'Responde trivia de preguntas y demuestra tu conocimiento general',
    };
    return descripciones[this.juegoActual()];
  }

}
