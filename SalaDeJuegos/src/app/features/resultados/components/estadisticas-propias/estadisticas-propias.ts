import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilaRankingGlobal, FilaRankingJuego } from '../../models/filas-tablas';

@Component({
  selector: 'app-estadisticas-propias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas-propias.html',
  styleUrls: ['./estadisticas-propias.css', '../../../../../styles/animations.css'],
})
export class EstadisticasPropias {
  emailActual = input<string | null>(null);
  ahorcado = input<FilaRankingJuego | null>(null);
  mayorMenor = input<FilaRankingJuego | null>(null);
  preguntados = input<FilaRankingJuego | null>(null);
  buscaMinas = input<FilaRankingJuego | null>(null);
  global = input<FilaRankingGlobal | null>(null);
}
