import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, timeout } from 'rxjs';
import { DificultadAhorcado } from '../../models/resultado-ahorcado';

export type FuentePalabra = 'api' | 'csv' | 'fallback';

export interface PalabraObtenida {
  palabra: string;
  fuente: FuentePalabra;
}

@Injectable({
  providedIn: 'root',
})
export class PalabrasApi {
  private readonly apiBase = 'https://random-word-api.herokuapp.com/word';
  private readonly csvUrl = 'assets/data/palabras-ahorcado.csv';

  constructor(private http: HttpClient) {}

  obtenerPalabra(dificultad: DificultadAhorcado): Observable<PalabraObtenida> {
    const diff = this.mapearDificultad(dificultad);
    const apiUrl = `${this.apiBase}?number=1&lang=es&diff=${diff}`;

    // Primero intenta API; si falla o tarda demasiado, cae al CSV local.
    return this.http.get<string[]>(apiUrl).pipe(
      timeout(5000),
      map((arr) => this.normalizarPalabra((arr?.[0] ?? '').trim())),
      switchMap((palabraApi) => {
        if (palabraApi) {
          return of({ palabra: palabraApi, fuente: 'api' as const });
        }
        return this.obtenerPalabraDesdeCsv(dificultad);
      }),
      catchError(() => this.obtenerPalabraDesdeCsv(dificultad))
    );
  }

  private obtenerPalabraDesdeCsv(dificultad: DificultadAhorcado): Observable<PalabraObtenida> {
    return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
      map((csv) => {
        const lineas = csv.trim().split('\n').slice(1);
        const filtradas = lineas
          .map((l) => l.trim().split(','))
          .filter((cols) => cols[0] === dificultad)
          .map((cols) => this.normalizarPalabra((cols[1] ?? '').trim()))
          .filter((palabra) => !!palabra);

        if (filtradas.length === 0) {
          return { palabra: 'MURCIELAGO', fuente: 'fallback' as const };
        }

        return {
          palabra: filtradas[Math.floor(Math.random() * filtradas.length)],
          fuente: 'csv' as const,
        };
      }),
      catchError(() => of({ palabra: 'MURCIELAGO', fuente: 'fallback' as const }))
    );
  }

  private mapearDificultad(dificultad: DificultadAhorcado): number {
    if (dificultad === 'facil') return 1;
    if (dificultad === 'medio') return 3;
    return 5;
  }

  private normalizarPalabra(palabra: string): string {
    return palabra
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-ZñÑ]/g, '')
      .toUpperCase();
  }
}
