# 🎮 Cyber Burn — Sala de Juegos

> Plataforma de minijuegos con autenticación, rankings en tiempo real y chat global.  
> Proyecto universitario desarrollado en Angular para la materia **Programación IV**.

---

## 🚀 Demo en vivo

[![Ver demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://TU-URL-DE-DEPLOY.com)

---

## 👤 Autor

|              |                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Nombre**   | Santino Casado                                                                                    |
| **LinkedIn** | [linkedin.com/in/santino-casado-1841902aa](https://www.linkedin.com/in/santino-casado-1841902aa/) |
| **GitHub**   | [github.com/SantinoCasado](https://github.com/SantinoCasado)                                      |
| **Email**    | [santino.casado05@gmail.com](mailto:santino.casado05@gmail.com)                                   |

---

## 📋 Descripcion general

Cyber Burn es una sala de juegos web donde los jugadores se registran, eligen su juego favorito, acumulan puntos y compiten en rankings globales. Todo en una interfaz oscura, animada y responsive.

### 🎯 Objetivo

Construir una Sala de Juegos donde usuarios autenticados puedan:

- 🕹️ jugar distintos minijuegos,
- 🧠 medir rendimiento cognitivo y motriz,
- 💾 guardar resultados en base de datos,
- 🏆 comparar desempeño con otros jugadores,
- 💬 interactuar en una sala de chat en tiempo real.

### ✅ Funcionalidades principales

- 🔐 Autenticacion de usuarios (login y registro).
- 🛡️ Guardias de ruta para proteger pantallas y juegos.
- 🎮 Juegos implementados:
  - 🪢 Ahorcado
  - 🃏 Mayor o Menor
  - 🌍 Preguntados
  - 💣 Busca Minas _(juego propio)_
- 📊 Guardado de partidas y puntajes en Supabase.
- 🥇 Ranking por juego y ranking global.
- 💬 Chat global en tiempo real.
- 👨‍💻 Pagina Quien Soy con datos consumidos desde la API de GitHub.
- 🎨 UI uniforme con Bootstrap, estilos personalizados y animaciones.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia         | Uso                        |
| ------------------ | -------------------------- |
| ⚡ Angular 21      | Framework frontend         |
| 🟦 TypeScript      | Tipado estático            |
| 🗄️ Supabase        | Auth + Database + Realtime |
| 🎨 Bootstrap 5     | Estilos y grid             |
| 🔣 Bootstrap Icons | Iconografia                |
| 🔁 RxJS            | Programacion reactiva      |

---

## 📸 Capturas de pantalla

> Coloca tus imagenes en: `SalaDeJuegos/src/assets/img/readme/`

### 🏠 Home

![Home](./SalaDeJuegos/src/assets/img/readme/home.png)

### 🔐 Login

![Login](./SalaDeJuegos/src/assets/img/readme/login.png)

### 📝 Registro

![Registro](./SalaDeJuegos/src/assets/img/readme/registro.png)

### 🪢 Juego: Ahorcado

![Ahorcado](./SalaDeJuegos/src/assets/img/readme/ahorcado.png)

### 🃏 Juego: Mayor o Menor

![Mayor o Menor](./SalaDeJuegos/src/assets/img/readme/mayor-menor.png)

### 🌍 Juego: Preguntados

![Preguntados](./SalaDeJuegos/src/assets/img/readme/preguntados.png)

### 💣 Juego propio: Busca Minas

![Busca Minas](./SalaDeJuegos/src/assets/img/readme/busca-minas.png)

### 💬 Chat global

![Chat](./SalaDeJuegos/src/assets/img/readme/chat.png)

### 📊 Estadisticas y ranking

![Ranking](./SalaDeJuegos/src/assets/img/readme/ranking.png)

### 👤 Quien soy

![Quien Soy](./SalaDeJuegos/src/assets/img/readme/quien-soy.png)

---

## 🗂️ Estructura del proyecto

```
SalaDeJuegos/
  src/
    app/
      core/          # 🛡️ guards, servicios base, auth
      features/      # 📄 modulos y paginas funcionales
      shared/        # 🔧 componentes compartidos
      layouts/       # 🖼️ navbar y estructuras visuales
    assets/
      data/          # 📦 JSONs locales
      icons/         # 🔣 iconografia
      images/        # 🖼️ imagenes de la app
```

---

## ⚙️ Instalacion y ejecucion local

**1. Clonar repositorio**

```bash
git clone https://github.com/SantinoCasado/PrograIV-TP1-CasadoSantino.git
cd PrograIV-TP1-CasadoSantino/SalaDeJuegos
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Levantar entorno local**

```bash
npm run start
```

**4. Abrir en navegador**

```
http://localhost:4200
```

---

## 📦 Build de produccion

```bash
npm run build
```

> Los archivos compilados se generan en `SalaDeJuegos/dist/`

---

## 🗄️ Base de datos y tiempo real

El proyecto usa **Supabase** para:

- 🔐 autenticacion de usuarios,
- 👤 guardado de perfiles,
- 💾 persistencia de partidas,
- 🏆 ranking global,
- 💬 chat en tiempo real (suscripcion a cambios via websockets).

---

## 📅 Estado por sprint

| Sprint      | Contenido                                                        |
| ----------- | ---------------------------------------------------------------- |
| ✅ Sprint 1 | Estructura base, auth inicial, home, quien soy, favicon          |
| ✅ Sprint 2 | Login/registro robustos, navegacion y experiencia de usuario     |
| ✅ Sprint 3 | Ahorcado, Mayor o Menor, chat global realtime                    |
| ✅ Sprint 4 | Preguntados, juego propio (Busca Minas), rankings y estadisticas |

---

## 🔮 Mejoras futuras

- 🧪 Tests end-to-end (E2E).
- 📈 Dashboard de metricas mas avanzado.
- 🌐 Internacionalizacion.
- ⚡ Optimizar carga de recursos y lazy loading adicional.

---

## 📄 Licencia

Uso academico. Proyecto desarrollado para **Programacion IV** — 2026.
