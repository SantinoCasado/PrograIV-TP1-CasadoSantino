import { Component, OnDestroy, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth/auth';
import { AhorcadoState } from '../../services/ahorcado-state/ahorcado-state';
import { PalabrasApi } from '../../services/palabras-api/palabras-api';
import { JuegosScore } from '../../services/juego-score/juegos-score';
import { PartidaAbandonable } from '../../../../core/interfaces/partida-abandonable';
import { DificultadAhorcado, ResultadoPartidaAhorcado } from '../../models/resultado-juego';

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
  private readonly _erroresComputed          = signal(0);
  private readonly _letrasAdivinadasComputed = signal(new Set<string>());
  private readonly _letrasErradasComputed    = signal(new Set<string>());

  // ---- Computed para mostrar en la UI ---------------------------------------------------
  readonly errores = this._erroresComputed.asReadonly();
  readonly letrasAdivinadasComputed = this._letrasAdivinadasComputed.asReadonly();
  readonly letrasErradasComputed = this._letrasErradasComputed.asReadonly();

  readonly imagenMonigote = computed(() =>
    `assets/images/ahorcado/monigote-tiza-${this._erroresComputed()}.svg`
  );

  readonly letrasVisibles = computed(() => {
    const adivinadas = this._letrasAdivinadasComputed();
    return this.palabra().map(l => adivinadas.has(l) ? l : '_'); // Muestra la letra si fue adivinada, sino un guion bajo
  });

  // ---- Teclado ----------------------------------------------------------------
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
  ) {}

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
      next: (palabra) => this.iniciarPartida(dificultad, palabra),
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

  // ----- Privados -------------------------------------------------------------------------------
  private iniciarPartida(d: DificultadAhorcado, palabra: string): void {
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

  private calcularPuntaje(): number {
    const base: Record<DificultadAhorcado, number> = { facil: 100, medio: 200, dificil: 400 };
    const puntos = base[this.dificultad()!]
      - (this._erroresComputed() * 15)
      - Math.max(0, this.state.obtenerTiempoSegundos() - 30);
    return Math.max(10, puntos);
  }

  private finalizarConResultado(resultado: ResultadoPartidaAhorcado): void {
    this.state.finalizarPartida();
    this.resultadoPartida.set(resultado);
    this.puntajeObtenido.set(resultado === 'ganada' ? this.calcularPuntaje() : 0);
    this.estado.set('resultado');
    this.guardarScore(resultado);
  }

  private registrarAbandono(): void {
    if (this.estado() !== 'jugando') return;
    this.state.finalizarPartida();
    this.guardarScore('abandonada');
  }

  private guardarScore(resultado: ResultadoPartidaAhorcado): void {
    const email = this.auth.usuario()?.email;
    if (!email) return;

    this.guardandoScore.set(true);
    this.score.guardarResultadoAhorcado({
      emailUsuario: email,
      dificultad: this.dificultad()!,
      palabra: this.state.palabraActual,
      tiempoSegundos: this.state.obtenerTiempoSegundos(),
      letrasSeleccionadas: this.state.letrasSeleccionadasCount,
      aciertos: this.state.aciertosCount,
      errores: this._erroresComputed(),
      resultado,
      puntaje: this.puntajeObtenido(),
    }).then(() => this.guardandoScore.set(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
