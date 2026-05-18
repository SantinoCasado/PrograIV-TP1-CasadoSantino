# PrograIV-TP1-CasadoSantino

Sala de juegos desarrollada en Angular para la materia Programacion IV.
La aplicacion permite registro/login de usuarios, juegos con logica propia,
chat global en tiempo real y estadisticas por juego y globales.

---

## Demo

- Deploy: https://TU-URL-DE-DEPLOY.com

---

## Autor

- Nombre y apellido: TU NOMBRE COMPLETO
- LinkedIn: https://www.linkedin.com/in/TU-PERFIL
- GitHub: https://github.com/TU-USUARIO
- Email: mailto:tu.email@dominio.com

---

## Vista general del proyecto

### Objetivo

Construir una Sala de Juegos donde usuarios autenticados puedan:

- jugar distintos minijuegos,
- medir rendimiento cognitivo y motriz,
- guardar resultados en base de datos,
- comparar desempeno con otros jugadores,
- interactuar en una sala de chat en tiempo real.

### Funcionalidades principales

- Autenticacion de usuarios (login y registro).
- Guardias de ruta para proteger pantallas y juegos.
- Juegos implementados:
  - Ahorcado
  - Mayor o Menor
  - Preguntados
  - Busca Minas (juego propio)
- Guardado de partidas y puntajes en Supabase.
- Ranking por juego y ranking global.
- Chat global en tiempo real.
- Pagina Quien Soy con datos consumidos desde la API de GitHub.
- UI uniforme con Bootstrap, estilos personalizados y animaciones.

---

## Tecnologias utilizadas

- Angular 21
- TypeScript
- Supabase (Auth + Database + Realtime)
- Bootstrap 5
- Bootstrap Icons
- RxJS

---

## Capturas (placeholders)

Coloca tus imagenes en esta carpeta:

SalaDeJuegos/src/assets/img/readme/

Luego reemplaza los nombres de archivo en esta seccion si lo necesitas.

### Home

![Home](./SalaDeJuegos/src/assets/img/readme/home.png)

### Login

![Login](./SalaDeJuegos/src/assets/img/readme/login.png)

### Registro

![Registro](./SalaDeJuegos/src/assets/img/readme/registro.png)

### Juego: Ahorcado

![Ahorcado](./SalaDeJuegos/src/assets/img/readme/ahorcado.png)

### Juego: Mayor o Menor

![Mayor o Menor](./SalaDeJuegos/src/assets/img/readme/mayor-menor.png)

### Juego: Preguntados

![Preguntados](./SalaDeJuegos/src/assets/img/readme/preguntados.png)

### Juego propio: Busca Minas

![Busca Minas](./SalaDeJuegos/src/assets/img/readme/busca-minas.png)

### Chat global

![Chat](./SalaDeJuegos/src/assets/img/readme/chat.png)

### Estadisticas y ranking

![Ranking](./SalaDeJuegos/src/assets/img/readme/ranking.png)

### Quien soy

![Quien Soy](./SalaDeJuegos/src/assets/img/readme/quien-soy.png)

---

## Estructura del proyecto

```
SalaDeJuegos/
	src/
		app/
			core/          # guards, servicios base, auth
			features/      # modulos y paginas funcionales
			shared/        # componentes compartidos
			layouts/       # navbar y estructuras visuales
		assets/
			data/          # JSONs locales
			icons/         # iconografia
			images/        # imagenes de la app
```

---

## Instalacion y ejecucion local

1. Clonar repositorio

```bash
git clone https://github.com/TU-USUARIO/PrograIV-TP1-CasadoSantino.git
cd PrograIV-TP1-CasadoSantino/SalaDeJuegos
```

2. Instalar dependencias

```bash
npm install
```

3. Levantar entorno local

```bash
npm run start
```

4. Abrir en navegador

```text
http://localhost:4200
```

---

## Build de produccion

```bash
npm run build
```

Los archivos compilados se generan en:

```
SalaDeJuegos/dist/
```

---

## Base de datos y tiempo real

El proyecto usa Supabase para:

- autenticacion de usuarios,
- guardado de perfiles,
- persistencia de partidas,
- ranking global,
- chat en tiempo real (suscripcion a cambios).

---

## Estado por sprint (resumen)

- Sprint 1: estructura base, auth inicial, home, quien soy, favicon.
- Sprint 2: login/registro robustos, navegacion y experiencia de usuario.
- Sprint 3: Ahorcado, Mayor o Menor, chat global realtime.
- Sprint 4: Preguntados, juego propio (Busca Minas), rankings y estadisticas.

---

## Mejoras futuras

- Tests end-to-end (E2E).
- Dashboard de metricas mas avanzado.
- Internacionalizacion.
- Optimizar carga de recursos y lazy loading adicional.

---

## Licencia

Uso academico. Proyecto desarrollado para Programacion IV.
