<p align="center">
	<img src="./public/greenchoice.svg" alt="GreenChoice Frontend" width="120" height="120" />
</p>

# Frontend — GreenChoice (React) ⚡

![Vite](https://img.shields.io/badge/Vite-%2340C463?style=flat&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.0-blue?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat&logo=nodedotjs&logoColor=white)
![Demo](https://img.shields.io/badge/Status-Demo-orange?style=flat)

This directory contains the frontend application built with React + Vite for the GreenChoice project.

The interface provides a conversational experience where users interact with an assistant that suggests more sustainable decisions. The design follows common chatbot patterns (e.g. ChatGPT) to minimize the learning curve.

Note: this is a DEMO — some buttons and options are intentionally disabled.
---

## Table of contents

- 📦 [Requirements](#requirements)
- ⚙️ [Install & Run (development)](#install--run-development)
- 🚀 [Build for production](#build-for-production)
- ☁️ [Suggested deployment](#suggested-deployment)

---

## Requirements

- Node.js 18+ (or the version you use in your development environment)
- npm or pnpm/yarn

Recommendation: use Node 18+ to avoid incompatibilities with modern dependencies.

---

## Install & Run (development)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Open your browser at the URL Vite reports (default: http://localhost:5173).

Tip: if you use pnpm or yarn, replace `npm install` with `pnpm install` or `yarn`.

---

## Build for production

```bash
npm run build
```

The output folder is `dist`. To preview the production build locally:

```bash
npm run preview
```

---

## Suggested deployment

- Static hosts: Vercel, Netlify, Cloudflare Pages, or any service that serves static content from `dist`.
- CI recommendation: in GitHub Actions install dependencies, run `npm run build`, and publish `dist` to your hosting provider.

