# CampusOS — PostgreSQL Database Schema (MVP)

**Version:** 1.1  
**Engine:** PostgreSQL 16  
**Primary keys:** `UUID` (`gen_random_uuid()`)  
**Timestamps:** `TIMESTAMPTZ` stored in UTC  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`API_SPECIFICATION.md`](./API_SPECIFICATION.md)

---

## 1. Entity Relationship Overview

```text
tenants (1) ──< (N) users
tenants (1) ──< (N) user_tenant_roles
users (1) ──< (N) parent_student_links >── (1) users (student)
tenants (1) ──< (N) departments ──< (N) programs ──< (N) batches ──< (N) sections
sections (1) ──< (N) section_subjects >── subjects
sections (1) ──< (N) student_enrollments >── users (students)
tenants (1) ──< (N) rooms
sections (1) ──< (N) timetable_slots >── rooms, users (faculty), subjects
timetable_slots (1) ──< (N) attendance_sessions ──< (N) attendance_records
sections (1) ──< (N) fee_invoices ──< (N) fee_payments
tenants (1) ──< (N) announcements
tenants (1) ──< (N) audit_logs
```

---

## 2. Naming & Conventions

* Table names: `snake_case`, plural (`timetable_slots`).
* Every tenant-owned row includes `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
* Soft delete: `deleted_at TIMESTAMPTZ` where noted; hard delete avoided for financial records.
* Enums implemented as PostgreSQL `ENUM` or `TEXT` + check constraints (MVP may use `TEXT`).

---

## 3. Core Tables (DDL excerpts)

### 3.1 Platform & identity

```sql
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  subdomain     TEXT NOT NULL UNIQUE,
  academic_year TEXT NOT NULL,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE app_role AS ENUM (
  'SUPER_ADMIN', 'PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE_ADMIN'
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id), -- NULL only for SUPER_ADMIN
  email         CITEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE user_tenant_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  user_id    UUID NOT NULL REFERENCES users(id),
  role       app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, role)
);

CREATE TABLE parent_student_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  parent_user_id    UUID NOT NULL REFERENCES users(id),
  student_user_id   UUID NOT NULL REFERENCES users(id),
  relationship      TEXT NOT NULL DEFAULT 'guardian',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, parent_user_id, student_user_id)
);
```

### 3.2 Academic hierarchy

```sql
CREATE TABLE departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE programs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  duration_years INT NOT NULL DEFAULT 4,
  UNIQUE (tenant_id, code)
);

CREATE TABLE batches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  program_id UUID NOT NULL REFERENCES programs(id),
  label      TEXT NOT NULL, -- e.g. 2024-2028
  start_year INT NOT NULL,
  end_year   INT NOT NULL,
  UNIQUE (tenant_id, program_id, label)
);

CREATE TABLE sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  batch_id   UUID NOT NULL REFERENCES batches(id),
  code       TEXT NOT NULL, -- A, B, C
  capacity   INT,
  UNIQUE (tenant_id, batch_id, code)
);

CREATE TABLE subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  credits    NUMERIC(4,1) NOT NULL DEFAULT 3.0,
  UNIQUE (tenant_id, code)
);

CREATE TABLE section_subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  section_id  UUID NOT NULL REFERENCES sections(id),
  subject_id  UUID NOT NULL REFERENCES subjects(id),
  UNIQUE (tenant_id, section_id, subject_id)
);

CREATE TABLE student_profiles (
  user_id     UUID PRIMARY KEY REFERENCES users(id),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  roll_number TEXT NOT NULL,
  section_id  UUID NOT NULL REFERENCES sections(id),
  UNIQUE (tenant_id, roll_number)
);
```

### 3.3 Rooms, timetable, attendance

```sql
CREATE TABLE rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  code       TEXT NOT NULL,
  room_type  TEXT NOT NULL, -- LECTURE_HALL, LAB
  capacity   INT NOT NULL,
  UNIQUE (tenant_id, code)
);

CREATE TABLE timetable_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  section_id      UUID NOT NULL REFERENCES sections(id),
  subject_id      UUID NOT NULL REFERENCES subjects(id),
  faculty_user_id UUID NOT NULL REFERENCES users(id),
  room_id         UUID NOT NULL REFERENCES rooms(id),
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  starts_at       TIME NOT NULL,
  ends_at         TIME NOT NULL,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

CREATE TABLE attendance_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  timetable_slot_id UUID NOT NULL REFERENCES timetable_slots(id),
  session_date      DATE NOT NULL,
  submitted_by      UUID NOT NULL REFERENCES users(id),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at         TIMESTAMPTZ, -- submitted_at + 24h unless overridden
  UNIQUE (tenant_id, timetable_slot_id, session_date)
);

CREATE TABLE attendance_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id),
  student_user_id       UUID NOT NULL REFERENCES users(id),
  status                attendance_status NOT NULL DEFAULT 'PRESENT',
  UNIQUE (attendance_session_id, student_user_id)
);
```

**Conflict indexes (timetable):** GiST or exclusion constraints on `(tenant_id, room_id, day_of_week, tsrange)` and `(tenant_id, faculty_user_id, day_of_week, tsrange)` recommended in implementation migration.

### 3.4 Finance (MVP simplified)

```sql
CREATE TABLE fee_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  name       TEXT NOT NULL,
  line_items JSONB NOT NULL, -- [{ "label": "Tuition", "amount": 45000 }, ...]
  due_date   DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

CREATE TABLE fee_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  student_user_id UUID NOT NULL REFERENCES users(id),
  template_id     UUID NOT NULL REFERENCES fee_templates(id),
  invoice_number  TEXT NOT NULL,
  total_amount    NUMERIC(12,2) NOT NULL,
  balance_due     NUMERIC(12,2) NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'UNPAID',
  idempotency_key TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE fee_payments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id),
  invoice_id             UUID NOT NULL REFERENCES fee_invoices(id),
  amount                 NUMERIC(12,2) NOT NULL,
  payment_method         TEXT NOT NULL, -- CASH, BANK, GATEWAY
  gateway_transaction_id TEXT,
  recorded_by            UUID REFERENCES users(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, gateway_transaction_id)
);
```

### 3.5 Communications & audit

```sql
CREATE TABLE announcements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  scope_type   TEXT NOT NULL, -- INSTITUTION, DEPARTMENT, SECTION
  scope_id     UUID,
  published_by UUID NOT NULL REFERENCES users(id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id),
  actor_user_id UUID NOT NULL REFERENCES users(id),
  actor_role   app_role NOT NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  before_state JSONB,
  after_state  JSONB,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Row-Level Security (RLS)

### 4.1 Session variable

```sql
-- Set per transaction from application layer
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';
```

### 4.2 Enable RLS (pattern)

```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_departments ON departments
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

Apply the same `tenant_isolation_*` policy template to **all** tenant-scoped tables listed above.

### 4.3 Super Admin bypass

Use a dedicated DB role `campusos_platform` with `BYPASSRLS` only for provisioning migrations—not for routine API connections. Application Super Admin routes use explicit checks, not RLS bypass, in MVP.

---

## 5. Indexing Guidelines

| Table | Index | Reason |
| :--- | :--- | :--- |
| `users` | `(tenant_id, email)` | Login lookup |
| `student_profiles` | `(tenant_id, section_id)` | Rosters |
| `timetable_slots` | `(tenant_id, section_id, day_of_week)` | Weekly views |
| `attendance_sessions` | `(tenant_id, session_date)` | Dashboards |
| `fee_invoices` | `(tenant_id, status, balance_due)` | Finance filters |
| `audit_logs` | `(tenant_id, created_at DESC)` | Governance UI |

---

## 6. Seed Data Contract

The demo seed (`scripts/seed_demo.py`) must create:

* Tenant: `Horizon Institute of Technology` (`horizon` subdomain)
* 4 departments, 15 rooms, 30 faculty, 500 students, 2 weeks of attendance, active invoices
* One login per role (documented in script output)

Aligns with [`CampusOS_Agile_Sprint_Plan.md`](./CampusOS_Agile_Sprint_Plan.md) — US-4.4.

---

## 7. Migrations

* Tool: **Alembic** (async-compatible revisions).
* Each migration that adds a tenant table must include RLS enable + policy in the same revision.
* Never drop columns with financial data without archival migration.