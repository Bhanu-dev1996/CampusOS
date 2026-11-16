# CampusOS API (`campusos-api`)

FastAPI modular monolith for the CampusOS MVP. Contracts: [`../../docs/API_SPECIFICATION.md`](../../docs/API_SPECIFICATION.md).

## Stack

- Python 3.11+
- FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2
- **PostgreSQL via [Supabase](../../docs/SUPABASE.md)** (hosted)
- Redis 7 (optional local Docker or Upstash)

## Setup

### 1. Database (Supabase)

1. Create a Supabase project and copy the **Direct connection** URI from **Project Settings → Database → Connect**.
2. Put it in `apps/api/.env` as `DATABASE_URL`, set `DATABASE_SSL=true`.
3. Run migrations: `alembic upgrade head`

See [`docs/SUPABASE.md`](../../docs/SUPABASE.md) for full steps.

### 2. Virtual environment

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
```

### 3. Environment

Copy `apps/api/.env.example` to `apps/api/.env` and set your Supabase credentials.

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