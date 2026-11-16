# CampusOS API (`campusos-api`)

FastAPI modular monolith for the CampusOS MVP. Contracts: [`../../docs/API_SPECIFICATION.md`](../../docs/API_SPECIFICATION.md).

## Stack

- Python 3.11+
- FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2
- PostgreSQL 16, Redis 7

## Setup

### 1. Database

**Option A — Docker** (requires port 5432 free):

```bash
docker compose -f ../../infra/docker/docker-compose.yml up -d
```

**Option B — [Supabase](../../docs/SUPABASE.md)** (hosted Postgres):

Put the **Direct connection** URI in `apps/api/.env` as `DATABASE_URL`, set `DATABASE_SSL=true`, then `alembic upgrade head`.

**Option C — PostgreSQL already on Windows** (if `InvalidPasswordError` for `campusos`):

Local Postgres is listening on `5432`; it does not include the `campusos` user until you create it. As superuser (`postgres`):

```bash
psql -U postgres -f ../../scripts/setup_local_postgres.sql
```

Or set `DATABASE_URL` in `.env` to your existing Postgres user/password and create database `campusos` manually.

### 2. Virtual environment

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
```

### 3. Environment

Copy repo root `.env.example` to `apps/api/.env` (or root `.env`) and adjust if needed.

### 4. Migrations & seed

```bash
alembic upgrade head
python ../../scripts/seed_demo.py
```

### 5. Run API

```bash
uvicorn app.main:app --reload --port 8000
```

- OpenAPI: http://localhost:8000/v1/docs  
- Health: http://localhost:8000/v1/health  

## Demo auth

```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"principal@horizon.edu","password":"CampusOS123!","tenant_subdomain":"horizon"}'
```

## Project layout

```text
app/
├── main.py              # FastAPI app, CORS, error envelope
├── core/                # config, security, errors, roles
├── db/                  # engine, sessions, SET LOCAL tenant
├── models/              # SQLAlchemy models (growing per schema doc)
├── api/deps.py          # DB session, JWT auth, RBAC
├── api/v1/router.py     # v1 route aggregation
└── modules/             # auth, health, platform, dashboard, …
```

## Tests

```bash
pytest
```