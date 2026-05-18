import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilaRankingGlobal, FilaRankingJuego } from '../../models/filas-tablas';

@Component({
  selector: 'app-tabla-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-general.html',
  styleUrls: ['./tabla-general.css', '../../../../../styles/animations.css'],
})
export class TablaGeneral {
  emailActual = input<string | null>(null);
  topAhorcado = input<FilaRankingJuego[]>([]);
  topMayorMenor = input<FilaRankingJuego[]>([]);
  topPreguntados = input<FilaRankingJuego[]>([]);
  topBuscaMinas = input<FilaRankingJuego[]>([]);
  topGlobal = input<FilaRankingGlobal[]>([]);
}
