import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Celda, Dificultad, DificultadId } from '../../models/buscaMinas';
import { Auth } from '../../../../core/services/auth/auth';
import { JuegosScore } from '../../services/juego-score/juegos-score';
import { ResultadoPartidaBuscaMinas } from '../../models/resultado-busca-minas';
import { PartidaAbandonable } from '../../../../core/interfaces/partida-abandonable';

/*
  BASADO EN: 
    https://github.com/javimontoto/Buscaminas
*/

type EstadoPartida = 'seleccion' | 'jugando' | 'ganada' | 'perdida' | 'reiniciada';
@Component({
  selector: 'app-busca-minas',
  standalone: false,
  templateUrl: './busca-minas.html',
  styleUrl: './busca-minas.css',
})

export class BuscaMinas implements PartidaAbandonable, OnDestroy {
    readonly dificultades: Dificultad[] = [
        { id: 'facil', nombre: 'Facil', tamanio: 8, minas: 10, jackpot: 200, tiempoObjetivoSeg: 160 },
        { id: 'medio', nombre: 'Medio', tamanio: 12, minas: 24, jackpot: 500, tiempoObjetivoSeg: 300 },
        { id: 'dificil', nombre: 'Dificil', tamanio: 14, minas: 38, jackpot: 900, tiempoObjetivoSeg: 420 },
        { id: 'experto', nombre: 'Experto', tamanio: 16, minas: 52, jackpot: 1400, tiempoObjetivoSeg: 600 },
    ];

    readonly puntosBanderaCorrecta = 40;
    readonly puntosNumero = 12;
    readonly puntosCeldaVacia = 4;
    readonly penalizacionBanderaIncorrecta = 8;

    dificultadSeleccionadaId: DificultadId = 'facil';
    estado: EstadoPartida = 'seleccion';
    tablero: Celda[][] = [];

    minasTotales = 0;
    banderasColocadas = 0;
    banderasCorrectas = 0;
    celdasSegurasReveladas = 0;
    celdasSegurasObjetivo = 0;

    puntaje = 0;
    tiempoJuegoSeg = 0;

    private intervaloTimer: ReturnType<typeof setInterval> | null = null;
    private inicioMs: number | null = null;
    private scoreGuardado = false;
    modalAbandonoVisible = false;
    private resolverAbandono: ((v: boolean) => void) | null = null;

    constructor(
        private auth: Auth,
        private score: JuegosScore,
        private router: Router,
    ) {
        this.irASeleccion();
    }

    // --------- Getters ---------------------------------------------------------------------
    get dificultadSeleccionada(): Dificultad {
        return this.dificultades.find((d) => d.id === this.dificultadSeleccionadaId) ?? this.dificultades[0];
    }

    get tamanioTablero(): number {
        return this.dificultadSeleccionada.tamanio;
    }

    get celdasPlanas(): Celda[] {
        return this.tablero.flat();
    }

    get stockBanderas(): number {
        return Math.max(0, this.minasTotales - this.banderasColocadas);
    }

    get minasRestantes(): number {
        return Math.max(0, this.minasTotales - this.banderasCorrectas);
    }

    get estadoMensaje(): string {
        if (this.estado === 'ganada') {
            return 'Ganaste la partida';
        }

        if (this.estado === 'perdida') {
            return 'Pisaste una mina';
        }

        if (this.estado === 'reiniciada') {
            return 'Partida reiniciada';
        }

        if (this.estado === 'jugando') {
            return this.inicioMs === null ? 'Hace tu primer movimiento' : 'Partida en curso';
        }

        return 'Elegi una dificultad para empezar';
    }

    get caritaRuta(): string {
        if (this.estado === 'ganada') return 'assets/images/buscaMinas/carita-ganada.svg';
        if (this.estado === 'perdida') return 'assets/images/buscaMinas/carita-perdida.svg';
        if (this.estado === 'jugando') return 'assets/images/buscaMinas/carita-jugando.svg';
        return 'assets/images/buscaMinas/carita-idle.svg';
    }

    get caritaAlt(): string {
        if (this.estado === 'ganada') return 'Carita ganadora';
        if (this.estado === 'perdida') return 'Carita de derrota';
        if (this.estado === 'jugando') return 'Carita en juego';
        return 'Carita lista para jugar';
    }

    // --------- Lógica ----------------------------------------------------------------------

    hayPartidaEnCurso(): boolean {
        return this.estado === 'jugando';
    }

    pedirConfirmacionAbandono(): Promise<boolean> {
        this.modalAbandonoVisible = true;
        return new Promise(resolve => { this.resolverAbandono = resolve; });
    }

    solicitarAbandonoManual(): void {
        this.modalAbandonoVisible = true;
    }

    async confirmarSalida(): Promise<void> {
        if (this.resolverAbandono) {
            await this.registrarAbandono();
            this.modalAbandonoVisible = false;
            this.resolverAbandono(true);
            this.resolverAbandono = null;
            return;
        }

        await this.registrarAbandono();
        this.modalAbandonoVisible = false;
        this.router.navigate(['/home']);
    }

    cancelarSalida(): void {
        this.modalAbandonoVisible = false;
        this.resolverAbandono?.(false);
        this.resolverAbandono = null;
    }

    ngOnDestroy(): void {
        void this.registrarAbandono();
        this.detenerTimer();
    }

    elegirDificultad(id: string): void {
        if (!this.esDificultadValida(id)) return;
        this.dificultadSeleccionadaId = id;
        this.iniciarPartida();
    }

    salir(): void {
        this.router.navigate(['/home']);
    }

    irAGuia(): void {
        this.router.navigate(['/guia'], { queryParams: { juego: 'busca-minas' } });
    }

    irASeleccion(): void {
        void this.registrarAbandono();
        this.detenerTimer();
        this.estado = 'seleccion';
    }

    nuevaPartida(): void {
        if (this.estado === 'seleccion') {
            this.iniciarPartida();
            return;
        }

        if (this.estado === 'jugando' || this.estado === 'perdida') {
            this.finalizarPartidaReiniciada();
            return;
        }

        this.iniciarPartida();
    }

    private iniciarPartida(): void {
        void this.registrarAbandono();
        this.detenerTimer();

        const dificultad = this.dificultadSeleccionada;
        this.minasTotales = dificultad.minas;
        this.estado = 'jugando';
        this.banderasColocadas = 0;
        this.banderasCorrectas = 0;
        this.celdasSegurasReveladas = 0;
        this.celdasSegurasObjetivo = dificultad.tamanio * dificultad.tamanio - dificultad.minas;
        this.puntaje = 0;
        this.tiempoJuegoSeg = 0;
        this.inicioMs = null;
        this.scoreGuardado = false;

        this.tablero = this.generarTablero(dificultad.tamanio, dificultad.minas);
        this.calcularAdyacencias();
    }

    clickIzquierdo(celda: Celda): void {
        if (this.estado !== 'jugando') return;
        if (celda.revelada || celda.marcada) return;

        if (this.inicioMs === null) {
            this.iniciarTimer();
            if (celda.tieneMina) {
                this.moverMinaDePrimeraJugada(celda);
            }
        }

        if (celda.tieneMina) {
            this.revelarMinas();
            this.estado = 'perdida';
            this.detenerTimer();
            this.guardarScore('perdida');
            return;
        }

        this.revelarZona(celda);
        this.validarVictoria();
    }

    clickDerecho(evento: MouseEvent, celda: Celda): void {
        evento.preventDefault();
        if (this.estado !== 'jugando') return;
        if (celda.revelada) return;

        const quiereMarcar = !celda.marcada;
        if (quiereMarcar && this.stockBanderas <= 0) return;

        celda.marcada = quiereMarcar;
        this.banderasColocadas += quiereMarcar ? 1 : -1;

        if (celda.tieneMina) {
            this.banderasCorrectas += quiereMarcar ? 1 : -1;
            if (quiereMarcar && !celda.puntajeBanderaOtorgado) {
                this.puntaje += this.puntosBanderaCorrecta;
                celda.puntajeBanderaOtorgado = true;
            }
        } else if (quiereMarcar) {
            this.puntaje = Math.max(0, this.puntaje - this.penalizacionBanderaIncorrecta);
        }
    }

    // Devuelve la ruta de la imagen del número a mostrar en la celda, o null si no corresponde mostrar número
    rutaNumero(celda: Celda): string | null {
        if (celda.adyacentes < 1 || celda.adyacentes > 6) return null;
        return `assets/images/buscaMinas/numero-${celda.adyacentes}.svg`;
    }

    private esDificultadValida(id: string): id is DificultadId {
        return this.dificultades.some((d) => d.id === id);
    }

    private iniciarTimer(): void {
        this.detenerTimer();
        this.inicioMs = Date.now();
        this.intervaloTimer = setInterval(() => {
            if (this.inicioMs === null) return;
            this.tiempoJuegoSeg = Math.floor((Date.now() - this.inicioMs) / 1000);
        }, 1000);
    }

    private detenerTimer(): void {
        if (this.intervaloTimer) {
            clearInterval(this.intervaloTimer);
            this.intervaloTimer = null;
        }
    }

    // Genera un tablero con el tamaño y cantidad de minas indicados, ubicando las minas aleatoriamente
    private generarTablero(tamanio: number, minas: number): Celda[][] {
        const nuevo: Celda[][] = Array.from({ length: tamanio }, (_, x) =>
            Array.from({ length: tamanio }, (_, y) => ({
                x,
                y,
                tieneMina: false,
                revelada: false,
                marcada: false,
                adyacentes: 0,
                puntajeBanderaOtorgado: false,
                puntajeNumeroOtorgado: false,
            })),
        );

        let minasUbicadas = 0;
        while (minasUbicadas < minas) {
            const x = Math.floor(Math.random() * tamanio);
            const y = Math.floor(Math.random() * tamanio);
            if (!nuevo[x][y].tieneMina) {
                nuevo[x][y].tieneMina = true;
                minasUbicadas++;
            }
        }

        return nuevo;
    }

    // Calcula el número de minas adyacentes para cada celda, marcando con -1 las que tienen mina
    private calcularAdyacencias(): void {
        for (const fila of this.tablero) {
            for (const celda of fila) {
                if (celda.tieneMina) {
                    celda.adyacentes = -1;
                    continue;
                }
                celda.adyacentes = this.vecinos(celda.x, celda.y).filter((v) => v.tieneMina).length;
            }
        }
    }
    
    // Devuelve las celdas vecinas a (x, y), sin incluir la celda misma y filtrando fuera de límites
    private vecinos(x: number, y: number): Celda[] {
        const vecinos: Celda[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= this.tamanioTablero || ny >= this.tamanioTablero) continue;
                vecinos.push(this.tablero[nx][ny]);
            }
        }
        return vecinos;
    }

    // Si la primera jugada es una mina, la movemos a la primera celda sin mina que encontremos (barrido por filas)
    private moverMinaDePrimeraJugada(celda: Celda): void {
        celda.tieneMina = false;
        for (const fila of this.tablero) {
            const destino = fila.find((c) => !c.tieneMina && c !== celda);
            if (destino) {
                destino.tieneMina = true;
                break;
            }
        }
        this.calcularAdyacencias();
    }

    // Revela la celda inicial y, si es una celda vacía, expande la revelación a sus vecinas recursivamente
    private revelarZona(inicial: Celda): void {
        const pila: Celda[] = [inicial];

        while (pila.length > 0) {
            const actual = pila.pop()!;
            if (actual.revelada || actual.marcada) continue;

            actual.revelada = true;
            this.celdasSegurasReveladas++;

            if (actual.adyacentes > 0 && !actual.puntajeNumeroOtorgado) {
                this.puntaje += this.puntosNumero;
                actual.puntajeNumeroOtorgado = true;
            }

            if (actual.adyacentes === 0) {
                this.puntaje += this.puntosCeldaVacia;
                for (const vecino of this.vecinos(actual.x, actual.y)) {
                    if (!vecino.revelada && !vecino.tieneMina && !vecino.marcada) {
                        pila.push(vecino);
                    }
                }
            }
        }
    }

    // Valida si se ha alcanzado la condición de victoria
    private validarVictoria(): void {
        if (this.celdasSegurasReveladas < this.celdasSegurasObjetivo) return;

        this.estado = 'ganada';
        this.detenerTimer();
        this.revelarMinasGanador();

        const bonusTiempo = this.calcularBonusTiempo();
        this.puntaje += this.dificultadSeleccionada.jackpot + bonusTiempo;
        this.guardarScore('ganada');
    }

    private async registrarAbandono(): Promise<void> {
        if (this.estado !== 'jugando') return;

        await this.guardarScore('abandonada');
        this.detenerTimer();
        this.inicioMs = null;
        this.estado = 'seleccion';
    }

    private finalizarPartidaReiniciada(): void {
        if (this.estado !== 'jugando' && this.estado !== 'perdida') return;
        this.detenerTimer();
        this.inicioMs = null;
        this.estado = 'reiniciada';
    }

    private async guardarScore(resultado: ResultadoPartidaBuscaMinas): Promise<void> {
        if (this.scoreGuardado) return;

        const email = this.auth.usuario()?.email;
        if (!email) {
            return;
        }

        this.scoreGuardado = true;
        try {
            const { error } = await this.score.guardarResultadoBuscaMinas({
                emailUsuario: email,
                dificultad: this.dificultadSeleccionadaId,
                puntaje: this.puntaje,
                resultado,
            });
            if (error) {
                this.scoreGuardado = false;
                console.error('[BUSCA-MINAS] Error guardando partida:', error);
                return;
            }
            console.log('[BUSCA-MINAS] Partida guardada');
        } catch (err: unknown) {
            this.scoreGuardado = false;
            console.error('[BUSCA-MINAS] Error inesperado guardando partida:', err);
        }
    }

    // Calcula el bonus de tiempo al ganar
    private calcularBonusTiempo(): number {
        const objetivo = this.dificultadSeleccionada.tiempoObjetivoSeg;
        const multiplicador = 3;
        return Math.max(0, (objetivo - this.tiempoJuegoSeg) * multiplicador);
    }

    // Revela todas las minas en el tablero (usado al perder)
    private revelarMinas(): void {
        for (const fila of this.tablero) {
            for (const celda of fila) {
                if (celda.tieneMina) {
                    celda.revelada = true;
                }
            }
        }
    }

    // Revela todas las minas que no fueron marcadas por el jugador al ganar, otorgando puntos por cada bandera correcta no colocada
    private revelarMinasGanador(): void {
        for (const fila of this.tablero) {
            for (const celda of fila) {
                if (celda.tieneMina) {
                    if (!celda.marcada) {
                        celda.marcada = true;
                        this.banderasColocadas++;
                    }
                    celda.revelada = true;
                }
            }
        }
        this.banderasCorrectas = this.minasTotales;
    }
}
