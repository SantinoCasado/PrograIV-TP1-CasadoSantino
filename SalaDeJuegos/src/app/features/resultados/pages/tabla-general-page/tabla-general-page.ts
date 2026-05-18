import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth/auth';
import { ResultadosService } from '../../services/resultados-service';
import { FilaRankingGlobal, FilaRankingJuego } from '../../models/filas-tablas';
import { TablaGeneral } from '../../components/tabla-general/tabla-general';
import { SidebarMenu } from '../../../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-tabla-general-page',
  standalone: true,
  imports: [CommonModule, TablaGeneral, SidebarMenu, RouterLink],
  templateUrl: './tabla-general-page.html',
  styleUrls: ['./tabla-general-page.css', '../../../../../styles/animations.css'],
})
export class TablaGeneralPage implements OnInit, OnDestroy {
  protected auth = inject(Auth);
  private resultadosService = inject(ResultadosService);
  private timer: ReturnType<typeof setTimeout> | null = null;

  cargando = signal(false);
  emailActual = signal<string | null>(null);

  topAhorcado = signal<FilaRankingJuego[]>([]);
  topMayorMenor = signal<FilaRankingJuego[]>([]);
  topPreguntados = signal<FilaRankingJuego[]>([]);
  topBuscaMinas = signal<FilaRankingJuego[]>([]);
  topGlobal = signal<FilaRankingGlobal[]>([]);

  async ngOnInit() {
    await this.esperarSesionRestaurada();
    if (!this.auth.usuario()) return;

    this.emailActual.set(this.auth.usuario()?.email ?? null);
    await this.cargarTodo();

    this.resultadosService.startRealtime(() => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.cargarTodo(), 250);
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    this.resultadosService.stopRealtime();
  }

  private esperarSesionRestaurada(timeoutMs = 2500): Promise<void> {
    if (this.auth.sesionRestaurada()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const inicio = Date.now();

      const verificar = () => {
        if (this.auth.sesionRestaurada() || Date.now() - inicio >= timeoutMs) {
          resolve();
          return;
        }

        setTimeout(verificar, 50);
      };

      verificar();
    });
  }

  private async cargarTodo() {
    this.cargando.set(true);
    try {
      const [topAhorcado, topMayorMenor, topPreguntados, topBuscaMinas, topGlobal] =
        await Promise.all([
          this.resultadosService.getTopPorJuego('ahorcado', 20),
          this.resultadosService.getTopPorJuego('mayor-menor', 20),
          this.resultadosService.getTopPorJuego('preguntados', 20),
          this.resultadosService.getTopPorJuego('busca-minas', 20),
          this.resultadosService.getTopGlobal(50),
        ]);

      this.topAhorcado.set(topAhorcado.data || []);
      this.topMayorMenor.set(topMayorMenor.data || []);
      this.topPreguntados.set(topPreguntados.data || []);
      this.topBuscaMinas.set(topBuscaMinas.data || []);
      this.topGlobal.set(topGlobal.data || []);
    } finally {
      this.cargando.set(false);
    }
  }
}
