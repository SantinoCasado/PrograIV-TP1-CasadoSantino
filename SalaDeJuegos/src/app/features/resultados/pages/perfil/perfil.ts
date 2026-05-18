import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth/auth';
import { ResultadosService } from '../../services/resultados-service';
import { FilaRankingGlobal, FilaRankingJuego } from '../../models/filas-tablas';
import { EstadisticasPropias } from '../../components/estadisticas-propias/estadisticas-propias';
import { SidebarMenu } from '../../../../shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, EstadisticasPropias, SidebarMenu, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css', '../../../../../styles/animations.css'],
})
export class Perfil implements OnInit, OnDestroy {
  protected auth = inject(Auth);
  private resultadosService = inject(ResultadosService);
  private timer: ReturnType<typeof setTimeout> | null = null;

  cargando = signal(false);
  emailActual = signal<string | null>(null);

  propiaAhorcado = signal<FilaRankingJuego | null>(null);
  propiaMayorMenor = signal<FilaRankingJuego | null>(null);
  propiaPreguntados = signal<FilaRankingJuego | null>(null);
  propiaBuscaMinas = signal<FilaRankingJuego | null>(null);
  propiaGlobal = signal<FilaRankingGlobal | null>(null);

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
      const email = this.emailActual();
      if (!email) return;

      const [ahorcado, mayorMenor, preguntados, buscaMinas, global] = await Promise.all([
        this.resultadosService.getPosicionUsuario('ahorcado', email),
        this.resultadosService.getPosicionUsuario('mayor-menor', email),
        this.resultadosService.getPosicionUsuario('preguntados', email),
        this.resultadosService.getPosicionUsuario('busca-minas', email),
        this.resultadosService.getPosicionGlobalUsuario(email),
      ]);

      this.propiaAhorcado.set(ahorcado.data ?? null);
      this.propiaMayorMenor.set(mayorMenor.data ?? null);
      this.propiaPreguntados.set(preguntados.data ?? null);
      this.propiaBuscaMinas.set(buscaMinas.data ?? null);
      this.propiaGlobal.set(global.data ?? null);
    } finally {
      this.cargando.set(false);
    }
  }
}
