# Stock Tracker App

Ionic React frontend for the Stock Tracker demo app. Built with Capacitor, Cordova, and a modern React stack targeting web.

## Tech Stack

- **Ionic React** with TypeScript (Vite bundler)
- **Capacitor** + **Cordova** (web-only usage)
- **@tanstack/react-query** for data fetching and caching
- **@emotion/react** + **@emotion/styled** for CSS-in-JS styling
- **Zod** for API response validation
- **Awesome Cordova Plugins** (`@awesome-cordova-plugins/status-bar`)
- **Capawesome** (`@capawesome/capacitor-app-update`)
- **Ionic Native** (`@ionic-native/core`, `@ionic-native/status-bar`)
- **@golevelup/ts-jest** (dev dependency)

## Prerequisites

- Node.js 18+
- The [Stock Tracker API](../stock-tracker-api) backend running on port 3001

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   The default API URL points to `http://localhost:3001`. Edit `.env` if the backend runs elsewhere.

3. **Start the backend first:**

   ```bash
   cd ../stock-tracker-api
   npm install
   cp .env.example .env
   npm run db:setup    # Creates database + tables + seed data (idempotent)
   npm run dev
   ```

4. **Start the frontend dev server:**

   ```bash
   npm run dev
   ```

   Opens at `http://localhost:5173` (Vite default).

## Demo Credentials

- **Email:** `demo@example.com`
- **Password:** `D3m0$tock!2025`

## App Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email/password form, stores JWT in localStorage |
| `/dashboard` | Dashboard | Portfolio summary card, list of tracked stocks with prices |
| `/add-stock` | Add Stock | Search bar, results list, tap to add stock to portfolio |
| `/stock/:symbol` | Stock Detail | SVG price chart, stats (market cap, volume, 52w high/low), remove button |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API base URL |

## Notes

- This is a **web-only** app. Capacitor and Cordova are included as dependencies and initialized, but no native platform builds are configured.
- The SVG price chart in Stock Detail is hand-built (no charting library).
- Capacitor config (`capacitor.config.ts`) points `webDir` to `dist/`.

hello world initial-one-repo,-later-other-repo-1774929749313 stock-tracker-app
