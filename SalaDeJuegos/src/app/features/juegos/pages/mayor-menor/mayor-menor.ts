import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth/auth';
import { CartasApi } from '../../services/cartas-api/cartas-api';
import { JuegosScore } from '../../services/juego-score/juegos-score';
import { PartidaAbandonable } from '../../../../core/interfaces/partida-abandonable';
import { PrediccionUsuario, CartaDeck } from '../../models/cartas-api';
import { ResultadoPartidaMayorMenor, ResultadoMayorMenor } from '../../models/resultado-MayorMenor';

type EstadoJuego = 'cargando' | 'jugando' | 'resultado';
@Component({
  selector: 'app-mayor-menor',
  standalone: false,
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css',
})
export class MayorMenor implements PartidaAbandonable, OnInit, OnDestroy {
  // -----  Signals de estado -----------------------------------------------------------------
  readonly estado           = signal<EstadoJuego>('cargando');
  readonly deckId           = signal<string>('');
  readonly resultadoPartida = signal<ResultadoPartidaMayorMenor | null>(null);
  readonly puntajeObtenido  = signal(0);
  readonly guardandoScore   = signal(false);
  readonly modalAbandonoVisible = signal(false);

  // ---- Signals del progreso del juego ---------------------------------------------------
  private readonly vidasSig           = signal(3);
  private readonly cartasAcertadasSig = signal(0);
  private readonly jugadasTotalesSig  = signal(0);
  private readonly cartaActualSig     = signal<CartaDeck | null>(null);
  private readonly proximaCartaSig    = signal<CartaDeck | null>(null);
  private readonly historialCartasSig = signal<CartaDeck[]>([]);

  // ---- Readonly para la UI --------------------------------------------------------------
  readonly vidas           = this.vidasSig.asReadonly();
  readonly cartasAcertadas = this.cartasAcertadasSig.asReadonly();
  readonly jugadasTotales  = this.jugadasTotalesSig.asReadonly();
  readonly cartaActual     = this.cartaActualSig.asReadonly();
  readonly proximaCarta    = this.proximaCartaSig.asReadonly();
  readonly historialCartas = this.historialCartasSig.asReadonly();

  readonly corazonesVisibles = computed(() =>
    Array.from({ length: 3 }, (_, i) => i < this.vidasSig() ? 'lleno' : 'roto')
  );

  readonly progreso = computed(() => {
    const total = this.jugadasTotalesSig();
    return total > 0 ? Math.round((this.cartasAcertadasSig() / total) * 100) : 0;
  });

  // ---- Modal abandono ----------------------------------------------------------------
  private resolverAbandono!: (v: boolean) => void;
  private sub: Subscription | null = null;
  private tiempoInicioMs = 0;

  constructor(
    private auth: Auth,
    private cartasApi: CartasApi,
    private score: JuegosScore,
    private router: Router,
  ) {}
  
  ngOnInit(): void {
    this.iniciarPartida();
  }

  // ----- PartidaAbandonable --------------------------------------------------------------
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

  // ----- Flujo del juego ----------------------------------------------------------------
  private iniciarPartida(): void {
    this.estado.set('cargando');
    this.tiempoInicioMs = Date.now();

    this.sub = this.cartasApi.crearMazoBarajado(1).subscribe({
      next: (response) => {
        this.deckId.set(response.deck_id);
        this.robarCartaInicial();
      },
      error: () => this.router.navigate(['/home']), // Si no se pudo iniciar la partida, volvemos al home
    });
  }

  private robarCartaInicial(): void {
    this.cartasApi.robarCartas(this.deckId(), 1).subscribe({
      next: (response) => {
        if (response.cards.length > 0) {
          this.cartaActualSig.set(response.cards[0]);
          this.estado.set('jugando');
        }
      },
      error: () => this.router.navigate(['/home']),
    });
  }

  realizarPrediccion(prediccion: PrediccionUsuario): void {
    if (this.estado() !== 'jugando') return;

    this.cartasApi.robarCartas(this.deckId(), 1).subscribe({
      next: (response) => {
        if (response.cards.length > 0) {
          const proxima = response.cards[0];
          this.proximaCartaSig.set(proxima);
          setTimeout(() => this.verificarPrediccion(prediccion, proxima), 600);
        }
      },
      error: () => this.finalizarConResultado('perdida'),
    });
  }

  private verificarPrediccion(prediccion: PrediccionUsuario, proxima: CartaDeck): void {
    const valorActual  = this.cartasApi.valorNumerico(this.cartaActualSig()!.value);
    const valorProximo = this.cartasApi.valorNumerico(proxima.value);

    const esCorrecta = prediccion === 'mayor'
      ? valorProximo > valorActual  // Si el usuario predijo "mayor", la próxima carta debe ser mayor que la actual
      : valorProximo < valorActual; // Si el usuario predijo "menor", la próxima carta debe ser menor que la actual

    // Guardar la carta actual en el historial (máximo 5)
    const cartaActualJugada = this.cartaActualSig();
    if (cartaActualJugada) {
      this.historialCartasSig.update(h => {
        const nuevo = [cartaActualJugada, ...h];
        return nuevo.length > 5 ? nuevo.slice(0, 5) : nuevo;
      });
    }

    this.jugadasTotalesSig.update(j => j + 1);  // Incrementamos el conteo de jugadas totales
    this.cartaActualSig.set(proxima); // La carta actual ahora es la que acabamos de robar
    this.proximaCartaSig.set(null); // Limpiamos la próxima carta para que no se muestre hasta que el usuario haga otra predicción

    if (esCorrecta) {
      this.cartasAcertadasSig.update(a => a + 1); // Incrementamos el conteo de cartas acertadas
    } else {
      this.vidasSig.update(v => v - 1); // Decrementamos las vidas restantes
      if (this.vidasSig() <= 0) this.finalizarConResultado('perdida');
    }
  }

  reiniciar(): void {
    this.vidasSig.set(3);
    this.cartasAcertadasSig.set(0);
    this.jugadasTotalesSig.set(0);
    this.historialCartasSig.set([]);
    this.jugadasTotalesSig.set(0);
    this.cartaActualSig.set(null);
    this.proximaCartaSig.set(null);
    this.resultadoPartida.set(null);
    this.puntajeObtenido.set(0);
    this.deckId.set('');
    this.iniciarPartida();
  }

  salir(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Navega a la guía del juego Mayor-Menor
   * Pasa el parámetro de query 'juego' para que se muestre la sección correcta
   */
  irAGuia(): void {
    this.router.navigate(['/guia'], {
      queryParams: { juego: 'mayor-menor' }
    });
  }

  // ----- Privados ------------------------------------------------------------------------
  private calcularBonusPorBloques(aciertos: number): number {
    const bloquesDeCinco = Math.floor(aciertos / 5);
    let bonusTotal = 0;

    // Bonus progresivo por cada bloque de 5 aciertos:
    // 5 -> +10, 10 -> +15, 15 -> +20, etc.
    for (let i = 0; i < bloquesDeCinco; i++) {
      bonusTotal += 10 + (i * 5);
    }

    return bonusTotal;
  }

  private calcularPuntaje(): number {
    const aciertos = this.cartasAcertadasSig();
    const vidasPerdidas  = 3 - this.vidasSig();
    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicioMs) / 1000);
    const bonusPorBloques = this.calcularBonusPorBloques(aciertos);

    // Mantiene la base existente, agregando bonus por hitos de aciertos.
    const puntos = (aciertos * 50) + bonusPorBloques - (vidasPerdidas * 30) - Math.max(0, tiempoSegundos - 60);
    const puntajeNormalizado = Math.max(0, puntos);

    // Si hubo al menos un acierto, siempre se recompensa con puntaje minimo.
    return aciertos > 0 ? Math.max(10, puntajeNormalizado) : 0;
  }

  private finalizarConResultado(resultado: ResultadoPartidaMayorMenor): void {
    this.resultadoPartida.set(resultado);
    const puntajeFinal = resultado === 'abandonada' ? 0 : this.calcularPuntaje();
    this.puntajeObtenido.set(puntajeFinal);
    this.estado.set('resultado');
    this.guardarScore(resultado);
  }

  private registrarAbandono(): void {
    if (this.estado() !== 'jugando') return;
    this.guardarScore('abandonada');
  }

  private guardarScore(resultado: ResultadoPartidaMayorMenor): void {
    const email = this.auth.usuario()?.email;
    if (!email) return;

    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicioMs) / 1000);
    this.guardandoScore.set(true);
    this.score.guardarResultadoMayorMenor({
      emailUsuario:    email,
      deckId:          this.deckId(),
      cartasAcertadas: this.cartasAcertadasSig(),
      jugadasTotales:  this.jugadasTotalesSig(),
      tiempoSegundos,
      resultado,
      puntaje:         this.puntajeObtenido(),
    }).then(() => this.guardandoScore.set(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
