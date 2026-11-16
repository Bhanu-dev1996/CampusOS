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

* Supabase `DATABASE_URL` in `apps/api/.env` (see [`docs/SUPABASE.md`](../docs/SUPABASE.md))
* `alembic upgrade head`
* API package installed (`pip install -e ".[dev]"`)

Future candidates: backup helpers, one-shot data import, CI smoke runners.