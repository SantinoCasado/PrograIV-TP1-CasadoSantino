import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { DificultadAhorcado } from '../../models/resultado-ahorcado';

@Injectable({
  providedIn: 'root',
})
export class PalabrasApi {
  private readonly csvUrl = 'assets/data/palabras-ahorcado.csv';

  constructor(private http: HttpClient) {}

  obtenerPalabra(dificultad: DificultadAhorcado): Observable<string> {
    return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
      map((csv) => {
        const lineas = csv.trim().split('\n').slice(1); // saltar header
        const filtradas = lineas
          .map((l) => l.trim().split(','))
          .filter((cols) => cols[0] === dificultad)
          .map((cols) => cols[1]);

        if (filtradas.length === 0) return 'MURCIELAGO';
        return filtradas[Math.floor(Math.random() * filtradas.length)];
      }),
      catchError(() => of('MURCIELAGO'))
    );
  }
}
