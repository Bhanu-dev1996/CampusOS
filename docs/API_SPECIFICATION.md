# CampusOS — REST API Specification (MVP v1)

**Version:** 1.1  
**Base URL (production):** `https://api.campusos.io/v1`  
**Base URL (local):** `http://localhost:8000/v1`  
**Content-Type:** `application/json`  
**OpenAPI:** served at `/v1/openapi.json`  
**Related:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)

---

## 1. Standard Headers & Conventions

### 1.1 Request headers

| Header | Required | Description |
| :--- | :---: | :--- |
| `Authorization` | Yes* | `Bearer <jwt>` (*except public auth routes) |
| `Idempotency-Key` | Conditional | UUID required on batch invoice generation and payment webhooks |
| `X-Request-Id` | Optional | Client trace; echoed in responses |
| `X-Tenant-Id` | Super Admin only | Target tenant for platform routes |

JWT claims (minimum):

```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "roles": ["FACULTY", "PARENT"],
  "active_role": "FACULTY",
  "exp": 1730000000
}
```

### 1.2 Pagination

List endpoints accept:

| Query | Default | Max |
| :--- | :--- | :--- |
| `page` | 1 | — |
| `page_size` | 25 | 100 |
| `sort` | resource-specific | — |
| `q` | — | search string when supported |

**Response envelope:**

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 25,
    "total_items": 120,
    "total_pages": 5
  }
}
```

### 1.3 Standard error response

```json
{
  "error": {
    "code": "TIMETABLE_CONFLICT",
    "message": "Prof. Sharma is already assigned to CS-301 (Section A) in Room 302 during Monday 09:00–10:00.",
    "details": {
      "conflict_type": "FACULTY_OVERLAP",
      "conflicting_slot_id": "8f14e45f-ea3c-4a12-9b11-223344556677"
    },
    "request_id": "req_01H..."
  }
}
```

### 1.4 Error code catalog (MVP)

| HTTP | `error.code` | When |
| :---: | :--- | :--- |
| 400 | `VALIDATION_ERROR` | Pydantic / business validation failed |
| 401 | `UNAUTHENTICATED` | Missing or expired token |
| 403 | `FORBIDDEN` | RBAC or scope denial |
| 404 | `NOT_FOUND` | Resource missing or cross-tenant masked |
| 409 | `TIMETABLE_CONFLICT` | Room/faculty/capacity conflict |
| 409 | `DUPLICATE_RESOURCE` | Unique constraint (e.g., roll number) |
| 422 | `ATTENDANCE_LOCKED` | Edit after 24h lock window |
| 429 | `RATE_LIMITED` | Too many requests |
| 503 | `SERVICE_UNAVAILABLE` | Dependency down |

---

## 2. Authentication & Session

### `POST /auth/login`

**Body:**

```json
{
  "email": "principal@horizon.edu",
  "password": "********",
  "tenant_subdomain": "horizon"
}
```

**Response `200`:**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "rt_...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### `POST /auth/refresh`

Rotate access token using refresh token (cookie or body).

### `POST /auth/switch-role`

**Body:**

```json
{
  "active_role": "PARENT",
  "linked_student_id": "student-uuid"
}
```

**Response:** new `access_token` with updated claims.

### `GET /me`

Current user profile, roles, and tenant metadata.

### `POST /auth/logout`

Invalidate refresh session.

---

## 3. Platform (Super Admin)

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/platform/tenants` | Provision tenant + invite Principal |
| `GET` | `/platform/tenants` | List tenants |
| `GET` | `/platform/tenants/{id}` | Tenant detail |

**Create tenant body:**

```json
{
  "name": "St. Xavier's College",
  "subdomain": "stxaviers",
  "academic_year": "2025-26",
  "principal_email": "admin@stxaviers.edu"
}
```

---

## 4. Academic Structure & Directories

| Method | Path | Roles | Notes |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/departments` | Principal | CRUD |
| `GET/POST` | `/programs` | Principal | Under department |
| `GET/POST` | `/batches` | Principal | |
| `GET/POST` | `/sections` | Principal | |
| `GET/POST` | `/subjects` | Principal | |
| `POST` | `/sections/{id}/subjects` | Principal | Map subjects |
| `GET` | `/students` | Principal, Faculty* | *Faculty: assigned sections only |
| `POST` | `/students` | Principal | Single create |
| `POST` | `/students/import` | Principal | CSV async job |
| `GET` | `/students/import/{job_id}` | Principal | Status + `errors.csv` URL |
| `GET/POST` | `/faculty` | Principal | Faculty directory |
| `POST` | `/parent-links` | Principal | Link parent ↔ student |

**Student create (excerpt):**

```json
{
  "email": "aarav@student.horizon.edu",
  "full_name": "Aarav Mehta",
  "roll_number": "CS24A045",
  "section_id": "section-uuid",
  "parent_email": "parent@example.com"
}
```

---

## 5. Rooms & Timetable

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET/POST` | `/rooms` | Room inventory |
| `GET` | `/timetable/sections/{section_id}` | Weekly grid for section |
| `GET` | `/timetable/me` | Faculty/student/parent personalized view |
| `POST` | `/timetable/slots` | Create slot (validates conflicts) |
| `PATCH` | `/timetable/slots/{id}` | Update unpublished slot |
| `POST` | `/timetable/sections/{section_id}/publish` | Publish all draft slots |

**Create slot body:**

```json
{
  "section_id": "uuid",
  "subject_id": "uuid",
  "faculty_user_id": "uuid",
  "room_id": "uuid",
  "day_of_week": 1,
  "starts_at": "09:00",
  "ends_at": "10:00"
}
```

**Conflict response `409`:** see §1.3.

---

## 6. Attendance

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/attendance/today` | Faculty: today's classes |
| `GET` | `/attendance/sessions` | Filter by date, section, faculty |
| `POST` | `/attendance/sessions` | Submit roll call |
| `PATCH` | `/attendance/sessions/{id}/records` | Edit within 24h window |
| `POST` | `/attendance/sessions/{id}/override` | Principal unlock + audit reason |
| `GET` | `/attendance/students/{student_id}/summary` | Percentages per subject |

**Submit session body:**

```json
{
  "timetable_slot_id": "uuid",
  "session_date": "2026-11-16",
  "records": [
    { "student_user_id": "uuid", "status": "PRESENT" },
    { "student_user_id": "uuid", "status": "ABSENT" }
  ]
}
```

---

## 7. Assignments & Gradebook (MVP)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET/POST` | `/assignments` | Faculty create coursework |
| `POST` | `/assignments/{id}/submissions` | Student submit |
| `PATCH` | `/assignments/{id}/submissions/{sid}` | Grade + feedback |
| `GET/POST` | `/assessments/marks` | Marks entry by section/subject |
| `POST` | `/assessments/publish` | Publish term report cards |

---

## 8. Finance

| Method | Path | Headers | Description |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/fee-templates` | — | Template CRUD |
| `POST` | `/fee-invoices/batch` | `Idempotency-Key` | Generate section/batch invoices |
| `GET` | `/fee-invoices` | — | Filter by status, student |
| `GET` | `/fee-invoices/{id}` | — | Detail + line items |
| `POST` | `/fee-payments` | — | Manual payment log |
| `POST` | `/fee-payments/checkout` | — | Start gateway session (test mode) |
| `POST` | `/webhooks/payments/{provider}` | signature | Razorpay/Stripe test webhooks |
| `GET` | `/fee-invoices/{id}/receipt` | — | PDF download URL |

**Batch invoices body:**

```json
{
  "template_id": "uuid",
  "scope_type": "SECTION",
  "scope_id": "section-uuid"
}
```

**Manual payment body:**

```json
{
  "invoice_id": "uuid",
  "amount": 30000.00,
  "payment_method": "BANK",
  "reference": "UTR1234567890"
}
```

---

## 9. Dashboards & Announcements

| Method | Path | Roles |
| :--- | :--- | :--- |
| `GET` | `/dashboard/principal` | Principal |
| `GET` | `/dashboard/finance` | Finance Admin |
| `GET/POST` | `/announcements` | Principal, Faculty (scoped) |
| `GET` | `/notifications` | All authenticated |
| `PATCH` | `/notifications/{id}/read` | Mark read |

**Principal dashboard response (excerpt):**

```json
{
  "attendance_today_percent": 92.4,
  "attendance_by_department": [],
  "fee_collected": 12500000.00,
  "fee_outstanding": 3200000.00,
  "classes_in_session": 18,
  "pending_attendance_submissions": 3
}
```

---

## 10. Audit

| Method | Path | Roles |
| :--- | :--- | :--- |
| `GET` | `/audit-logs` | Principal, Finance Admin |

Query: `entity_type`, `actor_user_id`, `from`, `to`.

---

## 11. Health

| Method | Path | Auth |
| :--- | :--- | :--- |
| `GET` | `/health` | No |
| `GET` | `/ready` | No |

---

## 12. Webhooks & Async Jobs

| Event | Delivery |
| :--- | :--- |
| Payment succeeded | `POST /webhooks/payments/*` → idempotent status update |
| CSV import complete | Poll `GET /students/import/{job_id}` |
| Absence alert | Internal queue (no public webhook in MVP) |

---

## 13. Versioning & Compatibility

* Breaking changes require `/v2` prefix and 90-day deprecation notice.
* MVP clients must pin to `v1` paths documented here.
* Enum values (`attendance_status`, `invoice_status`) are stable within `v1`.