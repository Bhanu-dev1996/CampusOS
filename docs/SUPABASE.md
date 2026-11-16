# CampusOS — Supabase (PostgreSQL) setup

Supabase is **hosted PostgreSQL**. CampusOS uses it only as the database (not Supabase Auth/Storage in MVP).

## 1. Create a project

1. [supabase.com](https://supabase.com) → **New project**
2. Save the **database password** (shown once)
3. Wait until the project is **Active**

## 2. Get the connection string

**Project Settings → Database → Connect**

For **migrations** (`alembic upgrade head`), use:

| Mode | Use for |
| :--- | :--- |
| **Direct connection** (`db.<ref>.supabase.co`, port **5432**) | Alembic, schema changes |
| **Session pooler** (port **5432**) | API runtime (optional) |
| **Transaction pooler** (port **6543**) | Avoid for Alembic (prepared statements) |

Copy the **URI** (looks like `postgresql://postgres.[ref]:[password]@...`).

## 3. Configure `apps/api/.env`

```env
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DATABASE_SSL=true
```

The app also accepts `postgresql://` or `postgres://` and converts to `postgresql+asyncpg://`.

If the password has `@`, `#`, or `%`, [URL-encode](https://www.urlencoder.org/) it in the URI.

Keep your existing `JWT_SECRET`, `CORS_ORIGINS`, etc.

## 4. Run migrations and seed

```bash
cd apps/api
.venv\Scripts\activate
alembic upgrade head
python ..\..\scripts\seed_demo.py
uvicorn app.main:app --reload --port 8000
```

Tables are created in Supabase **Table Editor** under schema `public`.

## 5. Redis

Supabase does **not** include Redis. `/v1/ready` may show `"redis": false` until you:

* run local Redis (`infra/docker/docker-compose.yml`), or  
* set `REDIS_URL` to [Upstash](https://upstash.com/) or similar later  

Auth and core CRUD work without Redis in MVP.

## 6. Verify

* Supabase → **Table Editor** → `tenants`, `users`, `user_tenant_roles` after seed  
* http://localhost:8000/v1/ready → `"database": true`  
* Login: `principal@horizon.edu` / `CampusOS123!` / tenant `horizon`

## Security

* Never commit `apps/api/.env` or expose the DB password  
* Use Supabase **network restrictions** / IP allowlist in production  
* Rotate the database password if it was shared or committed