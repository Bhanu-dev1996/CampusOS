-- Run as PostgreSQL superuser (e.g. postgres) while psql is connected:
--   psql -U postgres -f scripts/setup_local_postgres.sql
--
-- Matches apps/api/.env.example DATABASE_URL (campusos / campusos / campusos).

CREATE ROLE campusos WITH LOGIN PASSWORD 'campusos';
CREATE DATABASE campusos OWNER campusos;
GRANT ALL PRIVILEGES ON DATABASE campusos TO campusos;