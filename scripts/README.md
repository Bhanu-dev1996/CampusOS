# Scripts (`scripts/`)

Cross-cutting **development and operations** scripts that are not part of `apps/api` or `apps/web` packages.

| Script | Description |
| :--- | :--- |
| [`seed_demo.py`](./seed_demo.py) | Seeds **Horizon Institute** demo tenant, users, and roles (password `CampusOS123!`) |

## Run seed (after migrations)

```bash
cd apps/api
.venv\Scripts\activate
python ../../scripts/seed_demo.py
```

Requires:

* Docker Postgres up (`infra/docker/docker-compose.yml`)
* `alembic upgrade head`
* API package installed (`pip install -e ".[dev]"`)

Future candidates: backup helpers, one-shot data import, CI smoke runners.