// Predicción del usuario en Mayor o Menor
export type PrediccionUsuario = 'mayor' | 'menor';

// Carta individual de la API
export interface CartaDeck {
  code: string;
  image: string;
  images: { svg: string; png: string };
  value: string;
  suit: string;
}

// Respuesta base de Deck API
interface DeckBaseResponse {
  success: boolean;
  deck_id: string;
  remaining: number;
}

// Crear/barajar mazo
export interface DeckCrearResponse extends DeckBaseResponse {
  shuffled: boolean;
}

// Robar cartas
export interface DeckDrawResponse extends DeckBaseResponse {
  cards: CartaDeck[];
}