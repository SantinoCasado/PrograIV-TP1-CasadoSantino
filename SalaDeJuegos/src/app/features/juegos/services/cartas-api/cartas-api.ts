import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PrediccionUsuario,
  CartaDeck,
  DeckCrearResponse,
  DeckDrawResponse,
} from '../../models/cartas-api';

@Injectable({
  providedIn: 'root',
})
export class CartasApi {
  private readonly apiBase = 'https://deckofcardsapi.com/api/deck';

  constructor(private http: HttpClient) {}

  crearMazoBarajado(deckCount = 1): Observable<DeckCrearResponse> {
    return this.http.get<DeckCrearResponse>(
      `${this.apiBase}/new/shuffle/?deck_count=${deckCount}`
    );
  }

  robarCartas(deckId: string, count = 1): Observable<DeckDrawResponse> {
    return this.http.get<DeckDrawResponse>(
      `${this.apiBase}/${deckId}/draw/?count=${count}`
    );
  }

  valorNumerico(valorApi: string): number {
    if (valorApi === 'ACE') return 14;
    if (valorApi === 'KING') return 13;
    if (valorApi === 'QUEEN') return 12;
    if (valorApi === 'JACK') return 11;
    return Number(valorApi);
  }
}
