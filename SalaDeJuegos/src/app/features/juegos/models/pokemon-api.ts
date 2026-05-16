export interface NombreApiRecurso {
  name: string;
  url: string;
}

export interface ListaPokemonApi {
  count: number;
  next: string | null;
  previous: string | null;
  results: NombreApiRecurso[];
}

export interface PokemonApi {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      home?: { front_default: string | null };
      'official-artwork'?: { front_default: string | null };
    };
  };
}

export interface PokemonImagen {
  id: number;
  nombre: string;
  imageUrl: string;
}