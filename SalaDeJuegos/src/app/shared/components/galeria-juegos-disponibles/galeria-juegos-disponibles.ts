import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
  @Input() modoHome = false;

  juegos: JuegoDisponible[] = [
    {
      nombre: 'Ahorcado',
      imagen: '/assets/images/ahorcado.png',
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
}
