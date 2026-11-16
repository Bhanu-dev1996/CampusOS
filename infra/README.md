# Infrastructure (`infra/`)

Repo-level **local development** infrastructure — not application code.

| Path | Purpose |
| :--- | :--- |
| [`docker/docker-compose.yml`](./docker/docker-compose.yml) | PostgreSQL 16 and Redis 7 for the API |

## Usage

From the repository root (optional: `copy .env.example .env` for credential overrides):

```bash
docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml down
```

Postgres defaults match `apps/api/.env.example` (`campusos` / `campusos` / database `campusos` on port `5432`).

## Scope

* **In scope (MVP):** local Docker Compose.
* **Later:** `infra/terraform/`, staging/prod manifests, CI deploy configs — add here when introduced.