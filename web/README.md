# Baskly.money Frontend (Next.js 16)

This is the web frontend for Baskly.money, built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

---

## Getting Started

1. Environment Configuration

Create or verify `.env.local` inside this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

2. Install Dependencies

```bash
npm install
```

3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev` — Starts the Next.js development server with Turbopack on port 3000
- `npm run build` — Compiles and optimizes the production build
- `npm run start` — Runs the compiled production server
- `npm run lint` — Runs ESLint checks
- `npm test` — Runs the unit test suite for the Real-Time Pricing Oracle

---

## Directory Overview

- `src/app/` — Next.js App Router pages (Home, Sign In, Sign Up, Customer/Manager/Admin dashboards)
- `src/components/` — Modular UI components (Baskets, Modals, 3D Canvas, SIP Calculator)
- `src/context/` — Global application state managed by BasklyContext
- `src/services/` — Spring Boot API client (api.ts, authApi.ts) and Real-Time Pricing Oracle (pricingOracle.ts)
- `src/types/` — TypeScript types and interface definitions
- `public/` — Static assets, icons, and logos
