import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { DificultadAhorcado } from '../../models/resultado-ahorcado';

@Injectable({
  providedIn: 'root',
})
export class PalabrasApi {
  private readonly apiBase = 'https://random-word-api.herokuapp.com/word';
  // fallback en caso de que la API falle o no responda a tiempo
  private readonly fallback = [
    'guitarra',
    'montana',
    'ventana',
    'cuaderno',
    'escalera',
    'semaforo',
    'murcielago',
    'biblioteca',
    'astronomia',
  ]

  constructor(private http: HttpClient) {}

  // Obtiene una palabra aleatoria de la API según la dificultad, o una palabra de fallback si la API falla
  obtenerPalabra(dificultad: DificultadAhorcado): Observable<string> {
    const diff = this.mapearDificultad(dificultad);
    const url = `${this.apiBase}?number=1&lang=es&diff=${diff}`;

    // La API devuelve un array de palabras, tomamos la primera, la normalizamos y la convertimos a mayúsculas
    return this.http.get<string[]>(url).pipe(
      map((arr) => this.normalizarPalabra((arr?.[0] ?? '').trim())),  // Si la palabra es vacía o nula, usamos el fallback
      map((palabra) => (palabra ? palabra : this.fallbackAleatoria())), // Si la normalización resultó en una palabra vacía, usamos el fallback
      catchError(() => of(this.fallbackAleatoria()))
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
      .replace(/[\u0300-\u036f]/g, '')  // Elimina acentos y diacríticos
      .replace(/[^a-zA-ZñÑ]/g, '')    // Elimina caracteres no alfabéticos (excepto ñ)
      .toUpperCase();
  }

  private fallbackAleatoria(): string {
    const indice = Math.floor(Math.random() * this.fallback.length);
    return this.fallback[indice].toUpperCase();
  }
}
