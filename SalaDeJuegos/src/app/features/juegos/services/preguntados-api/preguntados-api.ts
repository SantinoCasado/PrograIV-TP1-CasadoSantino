import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, timeout, switchMap } from 'rxjs';
import { BanderaImagen, PaisDevuelto } from '../../models/banderas-api';
import { PokemonApi,  ListaPokemonApi, NombreApiRecurso, PokemonImagen } from '../../models/pokemon-api';

/*
API PARA LAS BANDERAS: https://api-ninjas.com/api/countryflag
API PARA LOS POKEMON: https://pokeapi.co/
*/

interface Pais {
  code: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class PreguntadosApi {
  private readonly countryFlagUrl = 'https://api.api-ninjas.com/v1/countryflag';
  private readonly pokemonBaseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private readonly paisesUrl = 'assets/data/paises.json';
  private readonly apiKey = 'HbNHHblWJ4UGfKdf3TlNYfIbnDLkEVwpCjTluwCS';

  private paisesCache: Pais[] | null = null;
  private pokemonCache: NombreApiRecurso[] | null = null;

  // Fallback mínimo por si falla la carga de assets
  private readonly paisesFallback: Pais[] = [
    { code: 'AR', nombre: 'Argentina' },
    { code: 'BR', nombre: 'Brasil' },
    { code: 'CL', nombre: 'Chile' },
    { code: 'US', nombre: 'Estados Unidos' },
    { code: 'ES', nombre: 'Espana' },
    { code: 'FR', nombre: 'Francia' },
  ];

  constructor(private http: HttpClient) {}  // Inyección de HttpClient para hacer peticiones HTTP

  cargarPaises(): Observable<Pais[]> {
    // Si ya tenemos los países en cache, los devolvemos directamente sin hacer una nueva petición HTTP
    if (this.paisesCache && this.paisesCache.length > 0) {
      return of(this.paisesCache);
    }

    // Si no están en cache, los cargamos desde el archivo JSON local. Si falla la carga, usamos el fallback.
    return this.http.get<Pais[]>(this.paisesUrl).pipe(
      map((paises) => (Array.isArray(paises) ? paises : [])),
      map((paises) => paises.filter((p) => !!p?.code && !!p?.nombre)),
      map((paises) => {
        if (paises.length === 0) return this.paisesFallback;
        this.paisesCache = paises;
        return paises;
      }),
      catchError((error) => {
        console.error('[PREGUNTADOS_API] Error cargando paises.json:', error);
        this.paisesCache = this.paisesFallback;
        return of(this.paisesFallback);
      })
    );
  }

  obtenerBanderaPais(countryCode: string): Observable<BanderaImagen | null> {
    // Configuración de headers y parámetros para la petición a la API de banderas. Se incluye la clave de API en los headers y el código del país en los parámetros.
    const headers = new HttpHeaders({
      'X-Api-Key': this.apiKey,
    });

    // El código del país se envía como parámetro en mayúsculas para asegurar la compatibilidad con la API. Se utiliza HttpParams para construir los parámetros de la consulta.
    const params = new HttpParams().set('country', countryCode.toUpperCase());

    // Realiza la petición HTTP GET a la API de banderas. Si la petición es exitosa, mapea la respuesta para devolver un objeto con el código del país y la URL de la imagen de la bandera. Si hay un error (como un timeout o un error de red), captura el error, lo loguea y devuelve null.
    return this.http.get<PaisDevuelto>(this.countryFlagUrl, { headers, params }).pipe(
      timeout(5000),
      map((resp) => ({
        countryCode: countryCode.toUpperCase(),
        imageUrl: resp.rectangle_image_url || resp.square_image_url,
      })),
      catchError((error) => {
        console.error('[PREGUNTADOS_API] Error al obtener bandera:', error);
        return of(null);
      })
    );
  }

  obtenerPaisAleatorio(paises: Pais[]): Pais {
    const origen = paises.length > 0 ? paises : this.paisesFallback;  // Si la lista de países proporcionada está vacía, se utiliza el fallback para asegurar que siempre haya opciones disponibles.
    const index = Math.floor(Math.random() * origen.length);  // Se genera un índice aleatorio dentro del rango de la lista de países (o del fallback) para seleccionar un país al azar.
    return origen[index];
  }
  // Este método se encarga de obtener un conjunto de países distractores para el juego, asegurándose de que no incluyan el país correcto. Se filtra la lista de países para excluir el país correcto, se mezclan aleatoriamente y se seleccionan los primeros 'cantidad' países como distractores. RECOMENDACION DE LA IA  
  obtenerDistractores(correcto: Pais, paises: Pais[], cantidad = 3): Pais[] {
    const origen = paises.length > 0 ? paises : this.paisesFallback;

    return origen
      .filter((pais) => pais.code !== correcto.code)
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidad);
  }

  mezclarOpciones(opciones: string[]): string[] {
    // Funcion para mezclar aleatoriamente las opciones de respuesta. Se utiliza el método sort con una función de comparación que devuelve un valor aleatorio para mezclar el orden de los elementos en el array.
    return [...opciones].sort(() => Math.random() - 0.5);
  }

  //--------------------------------------------------------------------------------------------------------
  // POKEMON API SECCION DE ENDPOINTS 
  obtenerListaPokemon(limit = 151, offset = 0): Observable<NombreApiRecurso[]> {
    // Cacheamos la lista base de 151 Pokemon para no repetir la misma request en cada ronda.
    if (limit === 151 && offset === 0 && this.pokemonCache && this.pokemonCache.length > 0) {
      return of(this.pokemonCache);
    }

    // seteo de parámetros para la consulta a la API de Pokémon. Se incluyen los parámetros 'limit' y 'offset' para controlar la cantidad de resultados devueltos y la paginación.
    const params = new HttpParams() 
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    // Realiza la petición HTTP GET a la API de Pokémon. Si la petición es exitosa, mapea la respuesta para devolver un array de recursos de Pokémon. Si hay un error (como un timeout o un error de red), captura el error, lo loguea y devuelve un array vacío.
    return this.http.get<ListaPokemonApi>(this.pokemonBaseUrl, { params }).pipe(
      map((resp) => resp.results ?? []),
      map((lista) => {
        if (limit === 151 && offset === 0 && lista.length > 0) {
          this.pokemonCache = lista;
        }
        return lista;
      }),
      catchError((error) => {
        console.error('[PREGUNTADOS_API] Error cargando lista de pokemon:', error);
        return of([]);
      })
    );
  }

  obtenerPokemonPorNombreONumero(idOrName: string | number): Observable<PokemonImagen | null> {
    const url = `${this.pokemonBaseUrl}/${idOrName}`; // URL de la API para obtener los detalles de un Pokémon específico por su nombre o número de ID. 

    // Pipe que maneja la respuesta de la API. Si la petición es exitosa, mapea la respuesta para extraer la mejor imagen disponible del Pokémon y formatear su nombre. Si no se encuentra una imagen, devuelve null. Si hay un error (como un timeout o un error de red), captura el error, lo loguea y devuelve null.
    return this.http.get<PokemonApi>(url).pipe(
      timeout(5000),
      map((resp) => {
        const imageUrl = this.extraerMejorImagenPokemon(resp);
        if (!imageUrl) return null;

        return {
          id: resp.id,
          nombre: this.formatearNombrePokemon(resp.name),
          imageUrl,
        };
      }),
      catchError((error) => {
        console.error('[PREGUNTADOS_API] Error cargando pokemon:', error);
        return of(null);
      })
    );
  }

  obtenerPokemonConDistractores(cantidadDistractores = 3): Observable<{
    correcto: PokemonImagen | null; // El Pokémon correcto que se debe adivinar, con su imagen y nombre formateado. Si no se pudo obtener un Pokémon válido, será null.
    distractores: string[]; // Los nombres de los Pokémon que se utilizan como distractores en la pregunta. Si no se pudieron obtener distractores válidos, será un array vacío.
  }> {
    // Pipe que obtiene una lista de Pokémon y luego selecciona uno al azar como el correcto, junto con un conjunto de distractores. 
    return this.obtenerListaPokemon(151, 0).pipe(
      switchMap((lista) => {  // SwitchMap maneja la respuesta de la lista de Pokémon. 
        if (lista.length < cantidadDistractores + 1) {  // Verifica que haya suficientes Pokémon en la lista para seleccionar el correcto y los distractores. 
          return of({ correcto: null, distractores: [] });  // Si no hay suficientes Pokémon, devuelve un resultado con el correcto como null y un array vacío de distractores.
        }

        const mezclados = [...lista].sort(() => Math.random() - 0.5); // Mezcla aleatoriamente la lista de Pokémon para seleccionar al correcto y los distractores de manera aleatoria.
        const elegido = mezclados[0]; // El primer Pokémon de la lista mezclada se selecciona como el correcto.
        const distractores = mezclados  // El distractores se seleccionan de los siguientes Pokémon en la lista mezclada, asegurándose de no incluir el correcto. Se formatean los nombres de los distractores para que sean más legibles.
          .slice(1, 1 + cantidadDistractores)
          .map((p) => this.formatearNombrePokemon(p.name));

          // Devuelve un observable que obtiene los detalles del Pokémon correcto (incluyendo su imagen) y combina esa información con los nombres de los distractores para formar el resultado final. Si no se pudo obtener un Pokémon válido, el correcto será null y los distractores serán un array vacío.
        return this.obtenerPokemonPorNombreONumero(elegido.name).pipe(
          map((correcto) => ({ correcto, distractores }))
        );
      }),
      catchError((error) => {
        console.error('[PREGUNTADOS_API] Error armando pokemon con distractores:', error);
        return of({ correcto: null, distractores: [] });
      })
    );
  }

  private extraerMejorImagenPokemon(resp: PokemonApi): string | null {
    return (
      resp.sprites?.other?.['official-artwork']?.front_default || // La img oficial como primera opcion
      resp.sprites?.other?.home?.front_default || // La img de la home como segunda opcion
      resp.sprites?.front_default ||  // La img frontal por defecto como tercera opcion
      null
    );
  }

  private formatearNombrePokemon(nombreCrudo: string): string {
    if (!nombreCrudo) return '';
    return nombreCrudo
      .replace(/-/g, ' ') // Reemplaza los guiones por espacios
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitaliza la primera letra de cada palabra
  }

}

