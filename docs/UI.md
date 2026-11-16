# CampusOS — Frontend UI Specification

**Version:** 1.1  
**Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui (`new-york`), Lucide Icons, TanStack Table v8, TanStack Query v5, Recharts  
**Theme:** See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

---

## 1. Installation & Setup

### 1.1 Create Next.js app

```bash
pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir
cd apps/web
```

### 1.2 Tailwind CSS v4

`src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #090d16;
  --color-surface: #111827;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

`postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

```bash
pnpm add tailwindcss @tailwindcss/postcss postcss lucide-react
```

### 1.3 shadcn/ui

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card table dialog sheet form input select badge sonner dropdown-menu avatar
```

Map shadcn CSS variables to design tokens in `globals.css` (`--background`, `--primary`, etc.).

### 1.4 API client & auth

```bash
pnpm add @tanstack/react-query zod react-hook-form @hookform/resolvers
```

* Store access token in memory; refresh via HTTP-only cookie route handler `app/api/auth/refresh/route.ts`.
* Attach `Authorization` header in a shared `apiClient` module.

---

## 2. Application Structure

```text
apps/web/src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (platform)/          # Super Admin
│   ├── (principal)/
│   ├── (faculty)/
│   ├── (student)/
│   ├── (parent)/
│   ├── (finance)/
│   ├── api/auth/            # refresh, logout route handlers
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── shell/               # CommandBar, Sidebar, RoleSwitcher
│   ├── data-table/
│   ├── attendance/
│   ├── timetable/
│   └── finance/
├── hooks/
│   ├── use-active-role.ts
│   └── use-tenant.ts
└── lib/
    ├── api-client.ts
    ├── rbac.ts              # client-side route guard helpers
    └── types.ts
```

---

## 3. Route Map (MVP)

| Route | Role(s) | Screen |
| :--- | :--- | :--- |
| `/login` | Public | Tenant subdomain + credentials |
| `/platform/tenants` | Super Admin | Tenant list + create |
| `/dashboard` | Principal | Command center KPIs |
| `/academics/*` | Principal | Departments → sections CRUD |
| `/directory/students` | Principal | Student table + CSV import |
| `/directory/faculty` | Principal | Faculty table |
| `/rooms` | Principal | Room inventory |
| `/timetable/builder` | Principal | Grid + conflict modal |
| `/timetable` | Faculty, Student, Parent | Personalized schedule |
| `/attendance/today` | Faculty | 1-tap roll call |
| `/attendance/history` | Faculty, Principal | Session list |
| `/assignments` | Faculty, Student | Coursework |
| `/grades` | Faculty, Student, Parent | Marks & report card |
| `/finance/invoices` | Finance, Student, Parent | Invoice ledger |
| `/finance/templates` | Finance | Fee templates |
| `/announcements` | Principal, Faculty | Scoped notices |
| `/audit` | Principal, Finance | Audit log viewer |
| `/settings/profile` | All | Profile & password |

**Middleware:** `middleware.ts` reads JWT/session, redirects unauthenticated users to `/login`, and blocks role-mismatched paths (server-side check duplicated in layout).

---

## 4. Key Screens & UX Requirements

### 4.1 Composite role switcher

* Dropdown in command bar listing all `roles[]` from `/me`.
* Parent role requires child picker when multiple `parent_student_links`.
* On switch: call `POST /auth/switch-role`, invalidate React Query caches, reload navigation.

### 4.2 Timetable builder

* Week grid: rows = time slots, columns = days.
* Drag or form assign `Subject + Faculty + Room`.
* On save error `409`, open dialog with conflict details and highlight conflicting cell (`DESIGN_SYSTEM` danger glow).

### 4.3 Attendance roll call

* Load roster for active period; all rows default **Present**.
* Toggle `Absent` / `Late` only; mono roll numbers.
* Sticky footer: counts + **Submit Attendance**.
* After 24h: read-only with "Request override" for Principal.

### 4.4 Finance ledger

* TanStack Table with columns: Invoice #, Student, Amount, Balance, Status.
* Filter chips: All / Unpaid / Overdue (overdue = past `due_date` and balance &gt; 0).
* Row action opens Sheet to log payment.

### 4.5 Principal dashboard

* 4 stat cards + Recharts bar (dept attendance) + donut (fee collection).
* Poll or SSE later; MVP uses React Query `refetchInterval: 60_000`.

---

## 5. State & Data Fetching

| Concern | Pattern |
| :--- | :--- |
| Server lists | `useQuery` with stable keys `['invoices', filters]` |
| Mutations | `useMutation` + optimistic UI only where safe (not payments) |
| Forms | `react-hook-form` + Zod schemas mirroring API bodies |
| Errors | Map `error.code` to toast + inline field errors |

---

## 6. Performance Budgets

| Metric | Target |
| :--- | :--- |
| LCP (dashboard) | &lt; 2.5s on fast 3G simulated |
| Table render (500 rows) | Virtualize when &gt; 100 rows |
| Bundle | Route-level code splitting per role group |

---

## 7. Testing (frontend)

| Layer | Tool |
| :--- | :--- |
| Unit | Vitest + Testing Library (role switcher, formatters) |
| E2E | Playwright — smoke paths from US-4.4 seed logins |
| Visual | Optional Chromatic for command bar / dashboard |

---

## 8. Environment Variables (`apps/web`)

| Name | Example |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/v1` |
| `NEXT_PUBLIC_APP_NAME` | `CampusOS` |

Never expose secrets in `NEXT_PUBLIC_*`.