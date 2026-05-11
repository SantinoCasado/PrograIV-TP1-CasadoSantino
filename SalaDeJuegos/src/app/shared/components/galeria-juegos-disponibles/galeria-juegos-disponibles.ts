import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';

interface JuegoDisponible {
  nombre: string;
  imagen: string;
  descripcion: string;
  rutaJuego?: string;
  evitarRecorte?: boolean;
}

@Component({
  selector: 'app-galeria-juegos-disponibles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria-juegos-disponibles.html',
  styleUrl: './galeria-juegos-disponibles.css',
})
export class GaleriaJuegosDisponibles {
  private router = inject(Router);

  // Verdadero si se muestra en Home, falso si se muestra en Bienvenida, es del tipo Input para que el componente sea reutilizable en ambos contextos
  @Input() modoHome = false;

  @Output() jugarClick = new EventEmitter<JuegoDisponible>();

  juegos: JuegoDisponible[] = [
    {
      nombre: 'Ahorcado',
      imagen: '/assets/images/ahorcado.jpg',
      descripcion: 'Adiviná la palabra antes de quedarte sin intentos.',
      rutaJuego: '/juegos/ahorcado',
      evitarRecorte: true,
    },
    {
      nombre: 'Busca Minas',
      imagen: '/assets/images/buscaMinas.png',
      descripcion: 'Descubrí el tablero sin activar ninguna mina.',
      rutaJuego: '/juegos/busca-minas',
      evitarRecorte: true,
    },
    {
      nombre: 'Mayor o Menor',
      imagen: '/assets/images/mayorMenor.jpg',
      descripcion: 'Predecí si la siguiente carta será mayor o menor.',
      rutaJuego: '/juegos/mayor-menor',
    },
    {
      nombre: 'Preguntados',
      imagen: '/assets/images/preguntados.png',
      descripcion: 'Respondé preguntas y sumá puntos por racha.',
      rutaJuego: '/juegos/preguntados',
    },
  ];

  // Emitir el evento jugarClick con el juego seleccionado cuando se hace clic en "Jugar"
  onJugar(juego: JuegoDisponible): void {
    this.jugarClick.emit(juego);
  }

  // Navegar a la guía del juego correspondiente
  onReglas(juego: JuegoDisponible): void {
    const slug = juego.rutaJuego?.split('/').pop();
    if (slug) {
      this.router.navigate(['/guia'], { queryParams: { juego: slug } });
    }
  }
}
