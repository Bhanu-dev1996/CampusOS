# CampusOS Web (`@campusos/web`)

Next.js frontend workspace for the CampusOS MVP. See [`../../docs/UI.md`](../../docs/UI.md) and [`../../docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md).

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Copy `.env.local.example` to `.env.local` (not the repo root `.env`). Set `NEXT_PUBLIC_API_BASE_URL` when the API is running.

## Current state

* **shadcn/ui** (`new-york`) with Input, Card, Table, Dialog, Sheet, Sonner toasts, and more under `src/components/ui/`
* Dark command-center shell (sidebar, role switcher, KPI dashboard) mapped to [`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md) tokens
* MVP route map with placeholder module pages
* Demo login (session in memory until `/v1/auth/login` is implemented)

Add more components:

```bash
npx shadcn@latest add form tabs -y
```