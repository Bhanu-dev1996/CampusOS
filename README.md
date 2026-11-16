# CampusOS

Multi-tenant education ERP — documentation in [`docs/`](./docs/README.md).

## Layout

| Path | Role |
| :--- | :--- |
| [`apps/web`](./apps/web) | Next.js frontend — install deps **inside** this folder (`node_modules` lives here) |
| [`apps/api`](./apps/api) | FastAPI backend — Python `.venv` lives here |
| [`infra/`](./infra/README.md) | Shared Docker (Postgres, Redis) |
| [`scripts/`](./scripts/README.md) | Repo-wide dev scripts (e.g. database seed) |
| [`.env.example`](./.env.example) | **Infra credentials only** — copy to root `.env` for Docker |
| `apps/api/.env` | API runtime (from `apps/api/.env.example`) |
| `apps/web/.env.local` | Web runtime (from `apps/web/.env.local.example`) |

## Quick start

### 1. Database (pick one)

* **Supabase:** follow [`docs/SUPABASE.md`](docs/SUPABASE.md) — set `DATABASE_URL` + `DATABASE_SSL=true` in `apps/api/.env`  
* **Local Docker:** `docker compose -f infra/docker/docker-compose.yml up -d` + default `DATABASE_URL` in `.env.example`

### 2. Backend

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
# Edit .env with your Supabase DATABASE_URL before migrating
alembic upgrade head
python ../../scripts/seed_demo.py
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd apps/web
copy .env.local.example .env.local
npm install
npm run dev
```

- Web: http://localhost:3000  
- API docs: http://localhost:8000/v1/docs  

Demo password (after seed): `CampusOS123!` — e.g. `principal@horizon.edu` / tenant `horizon`.