# CampusOS – MVP Scope & Requirements Specification (Phase 1)

**Document Version:** 1.1  
**Role:** Senior Business Analyst  
**Target Milestone:** Phase 1 – Core Institutional Operations Loop  
**Goal:** Deliver a working, multi-tenant institutional platform that solves daily academic, attendance, timetable, and basic fee visibility workflows end-to-end.

---

## 1. MVP Strategic Focus: "The Daily Operational Loop"

To keep the MVP lean while still proving **enterprise SaaS/ERP architecture** (not a basic CRUD app), Phase 1 focuses strictly on the daily operational loop connecting **Admins → Faculty → Students → Parents**:

1. **Multi-Tenant Foundation:** An institution is provisioned with isolated data (`tenant_id`), departments, classes, and role-based user accounts.
2. **Academic Setup & Scheduling:** Admins set up classes/sections, assign faculty, and publish conflict-checked weekly timetables.
3. **Daily Attendance & Instant Parent Loop:** Faculty mark 1-tap period attendance; absent students trigger immediate in-app/email alerts to parents.
4. **Core Fee Visibility & Tracking:** Finance Admins generate term invoices and record payments (online/manual); Parents and Students view live dues and download receipts.
5. **Executive Pulse Dashboard:** Principals view real-time daily attendance %, active class status, and fee collection progress on one screen.

---

## 2. In-Scope vs. Out-of-Scope (Strict Boundary)

| Capability Area | In-Scope for MVP (Phase 1) | Deferred to Phase 2 / Phase 3 |
| :--- | :--- | :--- |
| **Multi-Tenancy & Auth** | Subdomain/tenant isolation (`tenant_id` + RLS), JWT auth, 6-role RBAC, multi-role context switching. | SSO/SAML 2.0 enterprise federation, hardware MFA keys. |
| **Academics** | Department → Program → Batch → Section hierarchy, subject mapping, student/staff directories with CSV bulk import. | Automated end-of-year promotion/detention rules, alumni portal. |
| **Timetable** | Manual grid builder with **real-time conflict validation** (no double-booked rooms or faculty). | AI auto-timetable solver, substitute teacher auto-matcher. |
| **Attendance** | Web/mobile 1-tap period roll call, 24-hour edit lock, instant parent absence notification, 75% shortage badge. | RFID/biometric scanner webhooks, facial recognition check-in. |
| **Assessments** | Assignment creation & submission tracking, basic internal/exam marks entry, simple term report card view. | Complex relative grading curves, cryptographic QR transcripts, exam hall seat-matrix generator. |
| **Finance & Fees** | Fee structure templates, batch invoice generation, payment recording (Stripe/Razorpay test mode + manual cash/cheque), PDF receipts. | Complex installment late-fee compounding, automated scholarship proration, advance credit wallets. |
| **Communication** | Role/Section-scoped announcements & automated attendance/fee alerts (In-App + Email). | SMS gateway integration, 2-way parent-teacher chat, read-receipt analytics. |

---

## 3. MVP Functional Requirements (Prioritized Must-Haves)

### Epic 1: Tenant Provisioning & RBAC Engine
* **MVP-01 (Tenant Onboarding):** Super Admin can create a new institution (`name`, `subdomain`, `academic_year`) and generate the initial Principal Admin credentials.
* **MVP-02 (Row-Level Data Isolation):** All tenant tables enforce strict `tenant_id` scoping so Institution A can never query or mutate Institution B's records.
* **MVP-03 (Role-Based Access & Switching):** Enforce permission boundaries across all 6 personas (`Super Admin`, `Principal`, `Faculty`, `Student`, `Parent`, `Finance Admin`), allowing composite users (e.g., Faculty + Parent) to toggle active workspace roles cleanly.

### Epic 2: Academic Setup & Master Directories
* **MVP-04 (Academic Hierarchy):** Principal/Admin can create Departments, Programs, Batches, and Sections, and map Subjects to each section.
* **MVP-05 (Directory & CSV Onboarding):** Admins can onboard Students, Faculty, and Parent links individually or via validated CSV bulk upload with downloadable error reports for malformed rows.

### Epic 3: Conflict-Checked Timetable Management
* **MVP-06 (Weekly Schedule Builder):** Admins can assign a `Subject + Faculty + Room` to a specific `Section + Day + Time Slot`.
* **MVP-07 (Hard Conflict Guardrails):** The API must block schedule saves and return a clear conflict error if:
  * The selected `Room` is already occupied in that time slot.
  * The selected `Faculty` is already teaching another section in that time slot.
  * Room capacity is less than the enrolled section headcount.

### Epic 4: Real-Time Attendance & Parent Escalation
* **MVP-08 (1-Tap Period Roll Call):** Faculty see "Today's Schedule" on login and can submit attendance for any active period with all students defaulted to `Present` (toggling only `Absent` or `Late`).
* **MVP-09 (24-Hour Edit Window):** Faculty can modify submitted attendance within 24 hours; older records require Principal Admin unlock/override with an audit note.
* **MVP-10 (Automated Absence Alert):** Submitting an `Absent` status immediately dispatches an in-app notification and email alert to the linked Parent/Guardian.
* **MVP-11 (Live Attendance Percentage):** Student and Parent dashboards dynamically compute subject-wise and overall attendance percentages, flagging any subject below `75%` in amber/red.

### Epic 5: Core Fee Invoicing & Payment Tracking
* **MVP-12 (Fee Template & Batch Billing):** Finance Admin can define a term fee template (e.g., Tuition + Lab Fee) and batch-generate itemized invoices for an entire Batch or Section.
* **MVP-13 (Payment Recording & Receipts):** Finance Admin can log offline payments (Cash/Bank Transfer/Cheque) and Students/Parents can pay online via payment gateway integration, automatically updating invoice status (`UNPAID → PARTIAL → PAID`) and generating a downloadable receipt.

### Epic 6: Role-Specific Dashboards & Announcements
* **MVP-14 (Executive Command Center):** Principal Dashboard displays real-time cards for:
  * Today's Overall Attendance % (with department breakdown)
  * Total Fee Collected vs. Outstanding Balance
  * Active Classes / Faculty on Leave today
* **MVP-15 (Targeted Notice Board):** Principal and Faculty can publish announcements targeted to `All Institution`, a specific `Department`, or a single `Section`.

---

## 4. MVP User Stories & Acceptance Criteria (Sample Core Flows)

### Story 1: Conflict-Free Timetable Assignment
> **As a** Principal / Institution Admin,  
> **I want** the system to immediately alert me if a room or teacher is double-booked while building a class timetable,  
> **So that** we eliminate scheduling clashes before the semester starts.

* **Acceptance Criteria:**
  * **Given** Prof. Sharma is scheduled for `CS-301` in `Room 204` on `Monday 10:00–11:00`,
  * **When** the Admin attempts to assign Prof. Sharma to `CS-305` in `Room 102` on `Monday 10:00–11:00`,
  * **Then** the system rejects the save with HTTP `409 Conflict` and displays: *"Conflict: Prof. Sharma is already assigned to CS-301 (Section A) during this slot."*

### Story 2: Rapid Attendance & Instant Parent Alert
> **As a** Faculty member,  
> **I want** to mark attendance for my current period in under 30 seconds,  
> **So that** class time isn't wasted and parents of absent students are notified immediately.

* **Acceptance Criteria:**
  * **Given** a Faculty member opens their active class roster of 60 students,
  * **When** they mark 3 students as `Absent` and click `Submit Attendance`,
  * **Then** the attendance record is saved with a timestamp, the 3 students' cumulative attendance percentages recalculate immediately, and an absence notification is queued for those 3 students' linked Parent accounts.

---

## 5. MVP Technical & Non-Functional Guardrails

* **Response Latency:** Core API endpoints (timetable fetch, attendance submission, dashboard KPIs) must respond in `< 200ms` (p95).
* **Idempotency:** Batch invoice generation and payment webhooks must use unique idempotency keys so retries never create duplicate invoices or double-credited payments.
* **Audit Logging:** Every attendance override, grade edit, and fee payment must record `user_id`, `role`, `timestamp`, and `previous_value → new_value`.
* **Seed Data Script:** For portfolio demonstration purposes, the MVP must include a deterministic database seed script that populates **1 demo institution** with realistic data (`500 students`, `30 faculty`, `4 departments`, `15 rooms`, `2 weeks of attendance`, and `sample fee invoices`) so reviewers can test all 6 roles immediately on login.

---

## 6. MVP Definition of Done (DoD)

A feature is considered **Done** for the CampusOS MVP when:
1. Multi-tenant isolation (`tenant_id`) is verified via integration tests (cross-tenant access returns `403/404`).
2. RBAC permissions are enforced on both the backend API middleware and frontend route guards.
3. All CRUD and workflow states handle empty, loading, and validation error states cleanly.
4. End-to-end demo flow works seamlessly across all 6 role views using the seeded dataset.

---

## 7. Related Documents & Traceability

| Need | Document |
| :--- | :--- |
| Full business & NFR context | [`CampusOS_BRD_SRS.md`](./CampusOS_BRD_SRS.md) |
| Sprint stories & points | [`CampusOS_Agile_Sprint_Plan.md`](./CampusOS_Agile_Sprint_Plan.md) |
| System design | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Tables & RLS | [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) |
| REST endpoints | [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) |
| Visual & UX tokens | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) |
| Frontend routes & setup | [`UI.md`](./UI.md) |
| Doc index & local dev | [`README.md`](./README.md) |

Each MVP epic (`MVP-01` … `MVP-15`) maps to user stories `US-*` in the sprint plan and to API modules in [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) §§3–9.