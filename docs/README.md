# CampusOS — Multi-Tenant Enterprise Education ERP

**CampusOS** is a modern, multi-tenant Software-as-a-Service (SaaS) Education Management Platform engineered for schools, colleges, and universities. Built to replace fragmented legacy spreadsheets and siloed tools, CampusOS unifies academic hierarchies, conflict-checked scheduling, 1-tap classroom attendance with instant parent alerts, coursework grading, and double-entry fee ledgers into a single centralized command center.

**Documentation suite version:** 1.1  
**Last updated:** 2026-11-16  
**MVP target:** `v1.0-MVP` (see [`CampusOS_MVP_Scope.md`](./CampusOS_MVP_Scope.md))

---

## Core Architectural Highlights

* **True Multi-Tenancy (Shared DB, Row-Level Isolation):** Every institutional record is scoped by `tenant_id` and enforced at both the API middleware layer and PostgreSQL Row-Level Security (RLS) policies.
* **Composite Role-Based Access Control (RBAC):** Supports 6 distinct personas (`Super Admin`, `Principal`, `Faculty`, `Student`, `Parent`, `Finance Admin`) with instant in-session workspace switching for users holding multiple roles (e.g., Faculty + Parent).
* **Constraint-Checked Timetable Engine:** Validates room capacity, room availability, and faculty schedules in real time before persisting class slots—eliminating double-bookings.
* **Real-Time Attendance-to-Parent Loop:** 1-tap period roll call (default-present pattern) triggers immediate absence alerts to linked parents and flags students dropping below the **75%** attendance threshold (with optional **80%** early-warning band per [`CampusOS_BRD_SRS.md`](./CampusOS_BRD_SRS.md)).
* **Audit-Logged Fee Ledger:** Itemized term fee templates, idempotent batch invoice generation, partial payment tracking, and automated PDF receipt generation.

---

## Documentation Index

| Document | Audience | Description |
| :--- | :--- | :--- |
| [`CampusOS_BRD_SRS.md`](./CampusOS_BRD_SRS.md) | Product, BA, Engineering | Full BRD & SRS: personas, RBAC matrix, functional & non-functional requirements |
| [`CampusOS_MVP_Scope.md`](./CampusOS_MVP_Scope.md) | Product, Engineering | Phase 1 boundaries, MoSCoW matrix, MVP epics, Definition of Done |
| [`CampusOS_Agile_Sprint_Plan.md`](./CampusOS_Agile_Sprint_Plan.md) | Engineering, Scrum | 4-sprint (8-week) roadmap with story points and Gherkin acceptance criteria |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Engineering, DevOps | Modular monolith topology, tenancy, RLS, auth, async workers, deployment |
| [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) | Backend, DBA | PostgreSQL tables, constraints, indexes, and RLS policy templates |
| [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) | Backend, Frontend | REST `v1` contracts, headers, pagination, errors, MVP endpoint catalog |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Design, Frontend | Tokens, typography, layout, components, accessibility |
| [`UI.md`](./UI.md) | Frontend | Next.js App Router structure, shadcn/ui setup, route map per role |

### Reading order (new contributors)

1. [`CampusOS_MVP_Scope.md`](./CampusOS_MVP_Scope.md) — what we are building first  
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how the system is shaped  
3. [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) + [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) — data and contracts  
4. [`UI.md`](./UI.md) + [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — frontend implementation

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Table v8, Recharts |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| **Data** | PostgreSQL 16 (RLS), Redis (queues, rate limits, idempotency) |
| **Auth & storage** | JWT (RS256) with `tenant_id` / `active_role` claims; S3-compatible object storage for receipts & uploads |

---

## Repository Layout (target)

```text
campusos/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # FastAPI modular monolith
├── packages/
│   └── shared-types/        # OpenAPI-generated or hand-shared DTOs (optional)
├── infra/
│   ├── docker/              # compose for local Postgres, Redis, MinIO
│   └── migrations/          # Alembic revisions
├── scripts/
│   └── seed_demo.py         # Horizon Institute demo dataset
├── docs/                    # This documentation suite
└── .env.example
```

---

## Quick Start (Local Development)

> **Note:** Scaffold steps below describe the intended MVP layout. Run them after the `apps/` directories exist in the repository.

### 1. Prerequisites

* Docker Desktop (PostgreSQL 16, Redis, optional MinIO)
* Node.js 20+ and `pnpm` or `npm`
* Python 3.12+ and `uv` or `pip`

### 2. Clone and environment

```bash
git clone https://github.com/your-username/campusos.git
cd campusos
```

| File | Purpose |
| :--- | :--- |
| Root [`.env.example`](../.env.example) → `.env` | Postgres/Redis credentials for **Docker Compose** only |
| `apps/api/.env.example` → `apps/api/.env` | API: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, etc. |
| `apps/web/.env.local.example` → `apps/web/.env.local` | Web: `NEXT_PUBLIC_API_BASE_URL` |

Keep env files **per app**; the root template is not loaded by FastAPI or Next.js.

### 3. Start infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 4. Backend

```bash
cd apps/api
uv sync   # or: pip install -e ".[dev]"
alembic upgrade head
python ../../scripts/seed_demo.py
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend

```bash
cd apps/web
copy .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000` — login uses `POST /v1/auth/login` (see [`apps/api/README.md`](../apps/api/README.md)).

**Also see:** [`infra/README.md`](../infra/README.md), [`scripts/README.md`](../scripts/README.md).

---

## Glossary (cross-doc)

| Term | Meaning |
| :--- | :--- |
| **Tenant** | One educational institution workspace (`tenant_id`) |
| **Composite role** | One user identity with multiple roles in the same tenant |
| **Active role** | Role selected in the UI; encoded in JWT as `active_role` |
| **Section** | Smallest teaching group within a batch (e.g., Batch 2024 — Section A) |
| **Timetable slot** | Published `Section + Day + Time + Room + Faculty + Subject` assignment |
| **Attendance session** | Roll call instance tied to a timetable slot on a calendar date |

---

## Document maintenance

When changing MVP scope or API contracts, update in this order: BRD/SRS (if business rule changes) → MVP Scope → Sprint stories → `DATABASE_SCHEMA.md` → `API_SPECIFICATION.md` → `UI.md` / `DESIGN_SYSTEM.md`.

Duplicate or export artifacts (e.g. `.md.md` copies, prompt boilerplate) should not be committed; the canonical files live directly under `docs/`.