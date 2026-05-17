import { Component, OnDestroy, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../../../core/services/auth/auth';
import { JuegosScore } from '../../services/juego-score/juegos-score';
import { PartidaAbandonable } from '../../../../core/interfaces/partida-abandonable';
import { PreguntadosApi } from '../../services/preguntados-api/preguntados-api';
import { ResultadoPartidaPreguntados } from '../../models/resultado-preguntados';

type EstadoJuego = 'seleccion-modo' | 'cargando' | 'jugando' | 'resultado';
type ModoJuego = 'banderas' | 'pokemon';
const MAX_PREGUNTAS = 10;

@Component({
  selector: 'app-preguntados',
  standalone: false,
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados implements PartidaAbandonable, OnDestroy {
  // ----- Signals de estado -----------------------------------------------------------------
  readonly estado              = signal<EstadoJuego>('seleccion-modo');
  readonly modo                = signal<ModoJuego | null>(null);
  readonly vidas               = signal(3);
  readonly aciertos            = signal(0);
  readonly preguntasJugadas    = signal(0);
  readonly imagenUrl           = signal<string | null>(null);
  readonly nombreCorrecto      = signal<string>('');
  readonly opciones            = signal<string[]>([]);
  readonly seleccionada        = signal<string | null>(null);  // qué eligió el usuario
  readonly esCorrecta          = signal<boolean | null>(null); // feedback visual
  readonly resultadoPartida    = signal<ResultadoPartidaPreguntados | null>(null);
  readonly puntajeObtenido     = signal(0);
  readonly puntajeEnCurso      = signal(0);
  readonly guardandoScore      = signal(false);
  readonly modalAbandonoVisible= signal(false);
  readonly corazonesVisibles   = signal<('lleno' | 'roto')[]>(['lleno', 'lleno', 'lleno']);
  readonly letrasOpciones      = ['A', 'B', 'C', 'D'] as const;
   readonly maxPreguntas = MAX_PREGUNTAS; // expuesto para la UI

  //----- Estados internos privados ----------------------------------------------------------------
  private paises: { code: string; nombre: string }[] = [];
  private pokemonLista: { name: string; url: string }[] = []; // cache igual que paises
  private tiempoInicioMs = 0;
  private resolverAbandono!: (v: boolean) => void;
  private sub: Subscription | null = null;

  // ----- Constructor ----------------------------------------------------------------
  constructor(
    private auth: Auth,
    private preguntadosApi: PreguntadosApi,
    private score: JuegosScore,
    private router: Router,
  ) {
    effect(() => {  // efecto para redirigir si el usuario no está autenticado, o si la sesión se restauró pero no hay usuario (lo que indica que no se pudo restaurar la sesión)
      if (this.auth.sesionRestaurada() && !this.auth.usuario()) {
        this.router.navigate(['/log-in'], { queryParams: { msg: 'requiere-login' } });
      }
    });
  }

  // ----- Metodos del ciclo de vida ---------------------------------------------------------------
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
  
  elegirModo(modo: ModoJuego): void {
    this.modo.set(modo);  // Guarda el modo elegido para usarlo luego al guardar el score
    this.tiempoInicioMs = Date.now(); // Inicia el timer al elegir modo, justo antes de cargar la pregunta para que el tiempo de carga no penalice al jugador
    this.estado.set('cargando');  // Cambia el estado a cargando para mostrar un spinner o mensaje de carga mientras se obtiene la pregunta

    if (modo === 'banderas') {
      // Primero carga los países (con cache interno del servicio), luego la 1ra pregunta
      this.sub = this.preguntadosApi.cargarPaises().subscribe({
        next: (paises) => { this.paises = paises; this.cargarPreguntaBanderas(); },
        error: () => this.estado.set('seleccion-modo'),
      });
    } else {
        // Primero carga la lista de Pokémon (con cache interno del servicio), luego la 1ra pregunta
        this.sub = this.preguntadosApi.obtenerListaPokemon(151).subscribe({
          next: (lista) => { this.pokemonLista = lista; this.cargarPreguntaPokemon(); },
          error: () => this.estado.set('seleccion-modo'),
        });
    }
  }

  siguientePregunta(): void {
    this.modo() === 'banderas' ? this.cargarPreguntaBanderas() : this.cargarPreguntaPokemon();
  }

  reiniciar(): void {
    this.vidas.set(3);
    this.aciertos.set(0);
    this.preguntasJugadas.set(0);
    this.imagenUrl.set(null);
    this.nombreCorrecto.set('');
    this.opciones.set([]);
    this.seleccionada.set(null);
    this.esCorrecta.set(null);
    this.resultadoPartida.set(null);
    this.puntajeObtenido.set(0);
    this.puntajeEnCurso.set(0);
    this.corazonesVisibles.set(['lleno', 'lleno', 'lleno']);
    this.modo.set(null);
    this.paises = [];
    this.estado.set('seleccion-modo');
  }

  salir(): void { this.router.navigate(['/home']); }

  irAGuia(): void { this.router.navigate(['/guia'], { queryParams: { juego: 'preguntados' } }); }

  // ----- Métodos de juego ----------------------------------------------------------------
  private cargarPreguntaBanderas(): void {
    this.estado.set('cargando');
    const correcto     = this.preguntadosApi.obtenerPaisAleatorio(this.paises);
    const distractores = this.preguntadosApi.obtenerDistractores(correcto, this.paises);
    const opciones     = this.preguntadosApi.mezclarOpciones([correcto.nombre, ...distractores.map(d => d.nombre)]);

    this.sub = this.preguntadosApi.obtenerBanderaPais(correcto.code).subscribe({
      next: (bandera) => {
        this.nombreCorrecto.set(correcto.nombre);
        this.imagenUrl.set(bandera?.imageUrl ?? null);
        this.opciones.set(opciones);
        this.seleccionada.set(null);
        this.esCorrecta.set(null);
        this.estado.set('jugando');
      },
      error: () => this.estado.set('seleccion-modo'),
    });
  }

  private cargarPreguntaPokemon(): void {
    this.estado.set('cargando');
    this.sub = this.preguntadosApi.obtenerPokemonConDistractores().subscribe({
      next: ({ correcto, distractores }) => {
        if (!correcto) { this.estado.set('seleccion-modo'); return; }
        const opciones = this.preguntadosApi.mezclarOpciones([correcto.nombre, ...distractores]);
        this.nombreCorrecto.set(correcto.nombre);
        this.imagenUrl.set(correcto.imageUrl);
        this.opciones.set(opciones);
        this.seleccionada.set(null);
        this.esCorrecta.set(null);
        this.estado.set('jugando');
      },
      error: () => this.estado.set('seleccion-modo'),
    });
  }

  responder(opcion: string): void {
    if (this.estado() !== 'jugando' || this.seleccionada() !== null) return;

    const correcto = opcion === this.nombreCorrecto();
    this.seleccionada.set(opcion);
    this.esCorrecta.set(correcto);
    this.preguntasJugadas.update(n => n + 1);

    if (correcto) {
      this.aciertos.update(n => n + 1);
    } else {
      const nuevasVidas = this.vidas() - 1;
      this.vidas.set(nuevasVidas);
      // Actualización manual de corazones porque usamos signal, no computed
      this.corazonesVisibles.set(
        Array.from({ length: 3 }, (_, i) => i < nuevasVidas ? 'lleno' : 'roto')
      );
    }

    this.puntajeEnCurso.set(this.calcularPuntaje());

    // Espera 1.2s para mostrar feedback antes de pasar al siguiente estado
    if (this.vidas() <= 0) {
      setTimeout(() => this.finalizarConResultado('perdida'), 1200);
    } else if (this.preguntasJugadas() >= MAX_PREGUNTAS) {
      setTimeout(() => this.finalizarConResultado('ganada'), 1200);
    }
  }

  // ----- Lógica de puntaje ----------------------------------------------------------------
  private calcularPuntaje(): number {
    const errores        = this.preguntasJugadas() - this.aciertos();
    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicioMs) / 1000);
    const puntos = (this.aciertos() * 100) - (errores * 30) - Math.max(0, tiempoSegundos - 60);
    return this.aciertos() > 0 ? Math.max(10, puntos) : 0;
  }

  private finalizarConResultado(resultado: ResultadoPartidaPreguntados): void {
    const puntajeFinal = resultado === 'abandonada' ? 0 : this.calcularPuntaje();
    this.resultadoPartida.set(resultado);
    this.puntajeObtenido.set(puntajeFinal);
    this.estado.set('resultado');
    this.guardarScore(resultado, puntajeFinal);
  }

  private registrarAbandono(): void {
    if (this.estado() !== 'jugando') return;
    this.finalizarConResultado('abandonada');
  }

  private guardarScore(resultado: ResultadoPartidaPreguntados, puntaje: number): void {
    const email = this.auth.usuario()?.email;
    if (!email) return;

    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicioMs) / 1000);
    this.guardandoScore.set(true);
    const errores = this.preguntasJugadas() - this.aciertos();

    this.score.guardarResultadoPreguntados({
      emailUsuario: email, modo: this.modo()!,
      aciertos: this.aciertos(),
      errores,
      preguntasTotales: this.preguntasJugadas(),
      tiempoSegundos, resultado, puntaje,
    }).then(({ error }) => {
      if (error) console.error('[PREGUNTADOS] Error guardando partida:', error);
      else       console.log('[PREGUNTADOS] Partida guardada');
      this.guardandoScore.set(false);
    }, (err: unknown) => {
      console.error('[PREGUNTADOS] Error inesperado:', err);
      this.guardandoScore.set(false);
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
  
}
