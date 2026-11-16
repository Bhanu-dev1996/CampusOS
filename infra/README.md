# Infrastructure (`infra/`)

Repo-level **local development** infrastructure — not application code.

| Path | Purpose |
| :--- | :--- |
| [`docker/docker-compose.yml`](./docker/docker-compose.yml) | Local Redis 7 for the API (queues, rate limits — optional for MVP) |

**Database:** PostgreSQL is hosted on [Supabase](../docs/SUPABASE.md); it is not run in Docker for this project.

## Usage

From the repository root:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml down
```

Set `REDIS_URL=redis://localhost:6379/0` in `apps/api/.env` when using local Redis.

## Scope

* **In scope (MVP):** optional local Redis via Docker Compose; Supabase for Postgres.
* **Later:** `infra/terraform/`, staging/prod manifests, CI deploy configs — add here when introduced.