import { Component, OnDestroy, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth/auth';
import { AhorcadoState } from '../../services/ahorcado-state/ahorcado-state';
import { PalabraObtenida, PalabrasApi } from '../../services/palabras-api/palabras-api';
import { JuegosScore } from '../../services/juego-score/juegos-score';
import { PartidaAbandonable } from '../../../../core/interfaces/partida-abandonable';
import { DificultadAhorcado, ResultadoPartidaAhorcado } from '../../models/resultado-ahorcado';

type EstadoJuego = 'seleccion' | 'cargando' | 'jugando' | 'resultado';

@Component({
  selector: 'app-ahorcado',
  standalone: false,
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado implements PartidaAbandonable, OnDestroy {
  // ---- Signals de estado -----------------------------------------------------------------
  readonly estado             = signal<EstadoJuego>('seleccion');
  readonly dificultad         = signal<DificultadAhorcado | null>(null);
  readonly palabra            = signal<string[]>([]);
  readonly resultadoPartida   = signal<ResultadoPartidaAhorcado | null>(null);
  readonly puntajeObtenido    = signal(0);
  readonly guardandoScore     = signal(false);
  readonly modalAbandonoVisible = signal(false);

  // ---- Signals internos del progeso del juego --------------------------------------------
  // El _ indica que son signals privadas que no deberían ser leídas directamente desde la UI, sino a través de los computed públicos, son utiles porque combian a medida que resiven señales de otras variables y evitan repetidos y sincrinizan mejor los cambios de estado del juego con la ui.
  private readonly _erroresComputed          = signal(0);
  private readonly _letrasAdivinadasComputed = signal(new Set<string>());
  private readonly _letrasErradasComputed    = signal(new Set<string>());

  // ---- Computed para mostrar en la UI ---------------------------------------------------
  // Estos computed se actualizan automáticamente cuando cambian las signals de las que dependen, y son los que deberían ser usados en la plantilla para mostrar el estado del juego
  readonly errores = this._erroresComputed.asReadonly();
  readonly letrasAdivinadasComputed = this._letrasAdivinadasComputed.asReadonly();
  readonly letrasErradasComputed = this._letrasErradasComputed.asReadonly();

  readonly imagenMonigote = computed(() =>
    `assets/images/ahorcado/monigote-tiza-${this._erroresComputed()}.svg`
  );

  readonly aciertosCount = computed(() => this._letrasAdivinadasComputed().size);
  readonly erradasCount = computed(() => this._letrasErradasComputed().size);
  readonly precision = computed(() => {
    const jugadas = this.aciertosCount() + this.erradasCount();
    if (jugadas === 0) return 0;
    return Math.round((this.aciertosCount() / jugadas) * 100);
  });
  readonly puntajeEnCurso = computed(() => {
    if (!this.dificultad() || this.estado() !== 'jugando') return 0;

    const jugadas = this.aciertosCount() + this.erradasCount();
    if (jugadas === 0) return 0;

    return this.calcularPuntaje(this.state.obtenerTiempoSegundos());
  });

  readonly letrasVisibles = computed(() => {
    const adivinadas = this._letrasAdivinadasComputed();
    return this.palabra().map(l => adivinadas.has(l) ? l : '_'); // Muestra la letra si fue adivinada, sino un guion bajo
  });

  // ---- Teclado ----------------------------------------------------------------
  // Definicion del alfabeto que se usará para mostrar las letras disponibles para seleccionar en el juego. En este caso, se incluyen las letras A-Z y la letra Ñ.
  readonly letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  // ---- Modal abandono ----------------------------------------------------------------
  private resolverAbandono!: (v: boolean) => void;

  private sub: Subscription | null = null;

  constructor(
    private auth: Auth,
    public state: AhorcadoState,
    private palabrasApi: PalabrasApi,
    private score: JuegosScore,
    private router: Router,
  ) {
    // Verifica que después de restaurar sesión haya usuario; si no, redirige a login
    effect(() => {
      if (this.auth.sesionRestaurada() && !this.auth.usuario()) {
        this.router.navigate(['/log-in'], { queryParams: { msg: 'requiere-login' } });
      }
    });
  }

  // ----- PartidaAbandonable ---------------------------------------------------------------
  hayPartidaEnCurso(): boolean {
    return this.estado() === 'jugando';
  }

  pedirConfirmacionAbandono(): Promise<boolean> {
    this.modalAbandonoVisible.set(true);
    return new Promise(resolve => { this.resolverAbandono = resolve; });
  }

  confirmarSalida(): void {
    this.registrarAbandono();
    this.modalAbandonoVisible.set(false);
    this.resolverAbandono(true);
  }

  cancelarSalida(): void {
    this.modalAbandonoVisible.set(false);
    this.resolverAbandono(false);
  }

  // ----- Flujo de juego -------------------------------------------------------------------------------
  elegirDificultad(dificultad: DificultadAhorcado): void {
    this.dificultad.set(dificultad);
    this.estado.set('cargando');

    this.sub = this.palabrasApi.obtenerPalabra(dificultad).subscribe({
      next: (resultado) => this.iniciarPartida(dificultad, resultado),
      error: ()       => this.estado.set('seleccion'),
    });
  }

  elegirLetra(letra: string): void {
    if (this.estado() !== 'jugando') return;
    if (this.letraUsada(letra)) return;

    if (this.palabra().includes(letra)) {
      this._letrasAdivinadasComputed.update(s => new Set([...s, letra]));
      this.state.registrarAcierto();
      if (this.verificarVictoria()) this.finalizarConResultado('ganada');
    } else {
      this._letrasErradasComputed.update(s => new Set([...s, letra]));
      this._erroresComputed.update(n => n + 1);
      this.state.registrarError();
      if (this._erroresComputed() >= 6) this.finalizarConResultado('perdida');
    }
  }

  letraUsada(letra: string): boolean {
    return this._letrasAdivinadasComputed().has(letra) || this._letrasErradasComputed().has(letra);
  }

  reiniciar(): void {
    this.state.reiniciarTodo();
    this.palabra.set([]);
    this._letrasAdivinadasComputed.set(new Set());
    this._letrasErradasComputed.set(new Set());
    this._erroresComputed.set(0);
    this.resultadoPartida.set(null);
    this.puntajeObtenido.set(0);
    this.dificultad.set(null);
    this.estado.set('seleccion');
  }

  salir(): void {
    this.state.reiniciarTodo();
    this.router.navigate(['/home']);
  }

  /**
   * Navega a la guía del juego Ahorcado
   * Pasa el parámetro de query 'juego' para que se muestre la sección correcta
   */
  irAGuia(): void {
    this.router.navigate(['/guia'], {
      queryParams: { juego: 'ahorcado' }
    });
  }

  // ----- Privados -------------------------------------------------------------------------------
  private iniciarPartida(d: DificultadAhorcado, resultado: PalabraObtenida): void {
    const palabra = resultado.palabra;
    console.log(`[AHORCADO] Palabra cargada desde ${resultado.fuente}: ${palabra}`);

    // Asegura estado limpio incluso si se vuelve a entrar al componente sin pasar por salir().
    this.state.reiniciarTodo();

    this.palabra.set(palabra.split(''));
    this._letrasAdivinadasComputed.set(new Set());
    this._letrasErradasComputed.set(new Set());
    this._erroresComputed.set(0);
    this.state.iniciarPartida(d, palabra);
    this.estado.set('jugando');
  }

  private verificarVictoria(): boolean {
    const adivinadas = this._letrasAdivinadasComputed();
    return this.palabra().every(l => adivinadas.has(l));
  }

  private calcularPuntaje(tiempoSegundos: number): number {
    const base: Record<DificultadAhorcado, number> = { facil: 100, medio: 200, dificil: 400 };
    const bonusRapidez = Math.max(0, 30 - tiempoSegundos) * 2;
    const puntos = base[this.dificultad()!]
      + bonusRapidez
      - (this._erroresComputed() * 15)
      - Math.max(0, tiempoSegundos - 30);
    return Math.max(10, puntos);
  }

  private finalizarConResultado(resultado: ResultadoPartidaAhorcado): void {
    const tiempoPartida = this.state.obtenerTiempoSegundos();
    const puntajeFinal = resultado === 'ganada' ? this.calcularPuntaje(tiempoPartida) : 0;

    this.state.finalizarPartida();
    this.resultadoPartida.set(resultado);
    this.puntajeObtenido.set(puntajeFinal);
    this.estado.set('resultado');
    this.guardarScore(resultado, tiempoPartida, puntajeFinal);
  }

  private registrarAbandono(): void {
    if (this.estado() !== 'jugando') return;

    const tiempoPartida = this.state.obtenerTiempoSegundos();
    this.state.finalizarPartida();
    this.guardarScore('abandonada', tiempoPartida, 0);
  }

  private guardarScore(resultado: ResultadoPartidaAhorcado, tiempoPartida: number, puntaje: number): void {
    const email = this.auth.usuario()?.email;
    if (!email) return;

    this.guardandoScore.set(true);
    this.score.guardarResultadoAhorcado({
      emailUsuario: email,
      dificultad: this.dificultad()!,
      palabra: this.state.palabraActual,
      tiempoSegundos: tiempoPartida,
      letrasSeleccionadas: this.state.letrasSeleccionadasCount,
      aciertos: this.state.aciertosCount,
      errores: this._erroresComputed(),
      resultado,
      puntaje,
    })
      .then(({ error }) => {
        if (error) {
          console.error('[AHORCADO] Error guardando partida en Supabase:', error);
        } else {
          console.log('[AHORCADO] Partida guardada en Supabase');
        }
        this.guardandoScore.set(false);
      }, (err: unknown) => {
        console.error('[AHORCADO] Error inesperado guardando partida:', err);
        this.guardandoScore.set(false);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.state.reiniciarTodo();
  }
}
