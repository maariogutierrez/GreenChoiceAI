<p align="center">
	<img src="./public/greenchoice.svg" alt="GreenChoice Frontend" width="120" height="120" />
</p>

# Frontend — GreenChoice (React) ⚡

![Vite](https://img.shields.io/badge/Vite-%2340C463?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.0-blue?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat&logo=nodedotjs&logoColor=white)
![Demo](https://img.shields.io/badge/Status-Demo-orange?style=flat)

Este directorio contiene la aplicación frontend desarrollada con React + Vite para el proyecto GreenChoice (reto COTEC — IndesIAhack).

La interfaz proporciona una experiencia conversacional donde el usuario puede interactuar con un asistente que sugiere decisiones más sostenibles. El diseño sigue patrones familiares de chatbots (p. ej. ChatGPT) para minimizar la curva de aprendizaje.

Nota: esta es una DEMO — algunos botones y opciones están deshabilitados intencionadamente.

---

## Tabla de contenidos

- 📦 [Requisitos](#requisitos)
- ⚙️ [Instalación y ejecución](#instalaci%C3%B3n-y-ejecuci%C3%B3n-desarrollo)
- 🚀 [Construcción para producción](#construcci%C3%B3n-para-producci%C3%B3n)
- ☁️ [Despliegue sugerido](#despliegue-sugerido)


---

## Requisitos

- Node.js 18+ (o la versión que uses en tu entorno de desarrollo)
- npm o pnpm/yarn

Recomendación: usa Node 18+ para evitar incompatibilidades con dependencias modernas.

---

## Instalación y ejecución (desarrollo)

1. Instala dependencias:

```bash
cd frontend
npm install
```

2. Arranca en modo desarrollo:

```bash
npm run dev
```

Abre el navegador en la URL que indique Vite (por defecto http://localhost:5173).

Consejo: si usas pnpm o yarn, reemplaza `npm install` por `pnpm install` o `yarn`.

---

## Construcción para producción

```bash
npm run build
```

El resultado quedará en la carpeta `dist`. Para previsualizar localmente:

```bash
npm run preview
```

---

## Despliegue sugerido

- Hosts estáticos: Vercel, Netlify, Cloudflare Pages o cualquier servicio que sirva contenido estático desde `dist`.
- Recomendación para CI: en GitHub Actions instala dependencias, ejecuta `npm run build` y publica `dist` al hosting.

