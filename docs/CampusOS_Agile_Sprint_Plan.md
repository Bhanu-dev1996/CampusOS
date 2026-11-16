# CampusOS MVP – Agile Sprint Plan & User Stories

**Methodology:** Scrum (2-Week Sprints)  
**Total MVP Duration:** 8 Weeks (4 Sprints)  
**Total Story Points:** 118 Points (~28–32 pts/sprint)  
**Target Release:** v1.0-MVP (Multi-Tenant Daily Operational Loop)

---

## Sprint Roadmap Overview

| Sprint | Focus Area & Modules Covered | Story Points | Key Deliverable / Sprint Goal |
| :--- | :--- | :---: | :--- |
| **Sprint 1** | **Module 1:** Multi-Tenant Core & RBAC<br>**Module 2:** Academic Structure & Directories | 31 pts | Provision isolated tenants, enforce 6-role RBAC, and onboard academic hierarchies + CSV users. |
| **Sprint 2** | **Module 3:** Conflict-Checked Timetable Builder<br>**Module 4:** Smart Attendance & Parent Loop | 32 pts | Build collision-free class schedules and execute 1-tap attendance with instant parent absence alerts. |
| **Sprint 3** | **Module 5:** Assignments & Basic Gradebook<br>**Module 6:** Core Fee Invoicing & Payments | 31 pts | Enable coursework tracking, marks entry, batch fee billing, and receipt generation. |
| **Sprint 4** | **Module 7:** Role-Adaptive Dashboards & Notice Board<br>**Hardening:** Seed Data, Audit Logs & QA | 24 pts | Deliver the Principal Command Center, scoped announcements, audit trails, and demo seed dataset. |

---

## Sprint 1: Multi-Tenant Foundation, RBAC & Academic Setup (Weeks 1–2)

**Sprint Goal:** Establish strict multi-tenant data isolation (`tenant_id` + RLS), authenticate all 6 user roles with composite role switching, and configure the institutional academic hierarchy and user directories.

### US-1.1: Tenant Workspace Provisioning (Module 1) — `5 pts`
> **As a** Super Administrator,  
> **I want** to provision a new educational institution workspace with a unique subdomain and initial Principal account,  
> **So that** each school or university operates in a completely isolated environment.

* **Acceptance Criteria:**
  * **Given** I am logged in as a `Super Admin`,
  * **When** I submit the "Create Institution" form with `Name`, `Subdomain` (e.g., `stxaviers`), `Academic Year`, and `Principal Email`,
  * **Then** a new `tenant_id` record is created, an onboarding invite is dispatched to the Principal, and accessing `stxaviers.campusos.io` resolves exclusively to that tenant's context.

### US-1.2: Row-Level Data Isolation & RBAC Enforcement (Module 1) — `8 pts`
> **As a** Platform Architect / Security Admin,  
> **I want** every API query and database table scoped by `tenant_id` and verified against user role permissions,  
> **So that** cross-tenant data leaks and unauthorized actions are impossible.

* **Acceptance Criteria:**
  * **Given** an authenticated user belonging to `Tenant A`,
  * **When** an API request attempts to fetch or mutate a resource ID belonging to `Tenant B`,
  * **Then** PostgreSQL Row-Level Security (RLS) and API middleware block the request with HTTP `403 Forbidden` or `404 Not Found`.
  * **And** attempts by a `Student` or `Faculty` to call Admin-only endpoints (`POST /departments`, `POST /invoices`) return HTTP `403 Forbidden`.

### US-1.3: Multi-Role Workspace Switcher (Module 1) — `5 pts`
> **As a** user holding multiple roles (e.g., a Faculty member who is also a Parent),  
> **I want** to switch between my assigned roles or linked student profiles from the top navigation bar without logging out,  
> **So that** I can seamlessly manage both my teaching duties and my child's progress.

* **Acceptance Criteria:**
  * **Given** my user account has both `FACULTY` and `PARENT` roles mapped in the current tenant,
  * **When** I select `Parent View (Student: Aarav M.)` from the workspace switcher,
  * **Then** my active session context updates immediately, reloading the navigation and dashboard to reflect `PARENT` permissions scoped to `Aarav M.`.

### US-1.4: Academic Hierarchy Configuration (Module 2) — `5 pts`
> **As a** Principal / Institution Admin,  
> **I want** to configure Departments, Programs, Batches, Sections, and Subjects,  
> **So that** our academic structure accurately mirrors our institution's catalog.

* **Acceptance Criteria:**
  * **Given** I am logged in as `Principal Admin`,
  * **When** I create `Department: Computer Science` → `Program: B.Tech CS` → `Batch: 2024–2028` → `Section: A` and assign `Subject: Data Structures (CS-201)`,
  * **Then** the hierarchy persists and becomes available for student enrollment and timetable mapping.

### US-1.5: Student, Faculty & Parent CSV Bulk Onboarding (Module 2) — `8 pts`
> **As a** Principal / Institution Admin,  
> **I want** to upload a CSV file of students, faculty, and parent mappings with pre-import validation,  
> **So that** I can onboard 5,000 students and 250 staff without manual data entry.

* **Acceptance Criteria:**
  * **Given** I upload a `.csv` file containing 500 student rows and linked parent emails,
  * **When** 495 rows are valid and 5 rows contain duplicate roll numbers or invalid email formats,
  * **Then** the system either previews row-level validation errors before commit or imports the 495 valid records and generates a downloadable `errors.csv` detailing the exact line numbers and failure reasons for the 5 failed rows.

---

## Sprint 2: Conflict-Free Scheduling & Real-Time Attendance Loop (Weeks 3–4)

**Sprint Goal:** Deliver the conflict-checked timetable builder and complete the real-time classroom attendance workflow with automated parent absence notifications.

### US-2.1: Classroom & Lab Inventory Setup (Module 3) — `3 pts`
> **As a** Principal / Institution Admin,  
> **I want** to register classrooms and laboratories with room numbers, types (`Lecture Hall`, `Lab`), and seating capacities,  
> **So that** the timetable engine can validate room availability and capacity constraints.

* **Acceptance Criteria:**
  * **Given** I create `Room 302` (`Lecture Hall`, `Capacity: 60`),
  * **When** I view the room directory,
  * **Then** `Room 302` appears as selectable during timetable slot creation.

### US-2.2: Conflict-Checked Weekly Timetable Builder (Module 3) — `8 pts`
> **As a** Principal / Institution Admin,  
> **I want** the system to validate room availability, faculty schedules, and room capacity in real time when assigning class periods,  
> **So that** zero double-bookings occur across the institution.

* **Acceptance Criteria:**
  * **Given** `Prof. Verma` is assigned to `Section A` in `Room 302` on `Monday 09:00–10:00`,
  * **When** I attempt to assign `Prof. Verma` to `Section B` in `Room 105` on `Monday 09:00–10:00`,
  * **Then** the API rejects the request with HTTP `409 Conflict` and displays: *"Faculty Conflict: Prof. Verma is already scheduled for Section A in Room 302."*
  * **And** if `Section B` has 75 enrolled students and I select `Room 302` (`Capacity: 60`), the system blocks assignment with a capacity warning.

### US-2.3: Role-Based Timetable Views (Module 3) — `5 pts`
> **As a** Faculty member, Student, or Parent,  
> **I want** to view my personalized weekly class schedule with room numbers and subject details,  
> **So that** I know where every class takes place each day.

* **Acceptance Criteria:**
  * **Given** a published timetable for `Batch 2024 - Section A`,
  * **When** a `Student` in `Section A` opens the Timetable tab,
  * **Then** they see only `Section A`'s Monday–Saturday schedule, while a `Faculty` member sees only periods assigned to their `faculty_id` across all sections.

### US-2.4: 1-Tap Period Attendance & 24-Hour Edit Lock (Module 4) — `8 pts`
> **As a** Faculty member,  
> **I want** to submit period attendance in under 30 seconds with all students defaulted to `Present`,  
> **So that** I can complete roll call quickly and correct accidental taps within 24 hours.

* **Acceptance Criteria:**
  * **Given** I open my active `Monday 09:00` class roster of 60 students,
  * **When** all 60 students default to `Present`, I toggle 2 students to `Absent` and 1 to `Late`, and click `Submit Attendance`,
  * **Then** the session attendance is persisted with a submission timestamp.
  * **And** I can edit those records for up to 24 hours; after 24 hours, the UI locks editing and requires a `Principal Admin` override with a mandatory reason note.

### US-2.5: Instant Parent Absence Alert & Shortage Badge (Module 4) — `8 pts`
> **As a** Parent / Guardian,  
> **I want** to receive an immediate alert when my child is marked absent and see live subject-wise attendance percentages,  
> **So that** I am aware of missed classes immediately and can track the 75% minimum requirement.

* **Acceptance Criteria:**
  * **Given** a student is marked `Absent` in `Period 1`,
  * **When** the faculty submits the attendance sheet,
  * **Then** an asynchronous job dispatches an in-app notification and email alert to the linked `Parent` within 5 minutes.
  * **And** if the student's cumulative attendance in any subject drops below `75%`, a red `Shortage Risk (<75%)` badge displays on the Student, Parent, and Faculty views.

---

## Sprint 3: Assessments, Gradebook & Fee Billing Engine (Weeks 5–6)

**Sprint Goal:** Implement coursework tracking, exam marks entry, automated fee invoicing, and online/offline payment reconciliation with PDF receipts.

### US-3.1: Coursework Assignments & Submission Tracking (Module 5) — `5 pts`
> **As a** Faculty member,  
> **I want** to post assignments with due dates and track student submission statuses,  
> **So that** coursework is centralized rather than scattered across emails.

* **Acceptance Criteria:**
  * **Given** I create an assignment for `CS-201` with a `Due Date` and `Max Marks: 20`,
  * **When** students in `Section A` upload their submission link/file before the deadline,
  * **Then** their status updates from `Pending` to `Submitted` (or `Late` if past due date), and I can enter grades and feedback inline.

### US-3.2: Assessment Marks Entry & Term Report Card (Module 5) — `8 pts`
> **As a** Faculty member,  
> **I want** to enter internal and mid-term/final exam marks per subject and publish term results,  
> **So that** students and parents can view consolidated performance reports.

* **Acceptance Criteria:**
  * **Given** an assessment schema (`Internal: 30 + Final Exam: 70 = 100`),
  * **When** I enter marks for all students in `Section A` (validating `0 <= marks <= max_marks`) and click `Publish Results`,
  * **Then** the system calculates total marks, percentage, and pass/fail status, rendering a downloadable Term Report Card on the Student and Parent portals.

### US-3.3: Fee Structure Templates & Batch Invoice Generation (Module 6) — `8 pts`
> **As a** Finance Administrator,  
> **I want** to define itemized fee templates and batch-generate invoices for an entire Batch or Section,  
> **So that** term billing is accurate and takes seconds instead of days.

* **Acceptance Criteria:**
  * **Given** a fee template (`Tuition: ₹45,000 + Lab Fee: ₹5,000 + Library: ₹2,000 = ₹52,000`) with `Due Date: 2026-12-15`,
  * **When** I run "Generate Invoices" for `B.Tech CS - Batch 2024` (120 students),
  * **Then** 120 unique, sequentially numbered invoices (`INV-2026-0001` to `0120`) are created with status `UNPAID`, and re-running the batch with the same idempotency key does not create duplicate invoices.

### US-3.4: Online/Offline Payment Recording & PDF Receipts (Module 6) — `10 pts`
> **As a** Parent / Student or Finance Administrator,  
> **I want** to pay fees online (or log manual cash/bank payments) and immediately download a PDF receipt,  
> **So that** outstanding balances update in real time with verifiable proof of payment.

* **Acceptance Criteria:**
  * **Given** an `UNPAID` invoice of `₹52,000`,
  * **When** a Parent completes a partial payment of `₹30,000` via payment gateway checkout (or Finance Admin logs a manual bank transfer of `₹30,000` with reference number),
  * **Then** the invoice status transitions to `PARTIALLY_PAID`, `balance_due` updates to `₹22,000`, and an itemized PDF receipt (`REC-2026-XXXX`) is generated and available for download.

---

## Sprint 4: Executive Dashboards, Communications & MVP Hardening (Weeks 7–8)

**Sprint Goal:** Build the Principal Command Center, role-scoped announcements, audit log viewer, and deterministic demo seed dataset for portfolio/production readiness.

### US-4.1: Principal Executive Command Center (Module 7) — `8 pts`
> **As a** Principal / Institution Admin,  
> **I want** a single-screen real-time executive dashboard summarizing daily attendance, fee recovery, and department metrics,  
> **So that** I can monitor institutional health without requesting manual reports.

* **Acceptance Criteria:**
  * **Given** I log in as `Principal Admin`,
  * **When** the Command Center loads,
  * **Then** I see real-time KPI cards and charts for:
    1. **Today's Institutional Attendance %** (with department-wise breakdown and chronic absentee count).
    2. **Term Fee Collection Progress** (`Collected ₹` vs. `Outstanding ₹` and collection rate %).
    3. **Active Classes & Faculty Status** (classes in session right now vs. pending attendance submissions).

### US-4.2: Scoped Institutional Notice Board (Module 7) — `5 pts`
> **As a** Principal Admin or Faculty member,  
> **I want** to publish announcements targeted to the entire institution, a specific department, or a single class section,  
> **So that** relevant stakeholders receive timely updates without noise.

* **Acceptance Criteria:**
  * **Given** I create an announcement titled *"Lab Exam Rescheduled"* scoped to `B.Tech CS - Section A`,
  * **When** I publish the notice,
  * **Then** only `Students`, `Parents`, and `Faculty` mapped to `Section A` see the announcement on their dashboard feed, while `Section B` users do not.

### US-4.3: Critical Action Audit Log Viewer (Module 1 / Governance) — `5 pts`
> **As a** Principal Admin or Finance Admin,  
> **I want** an immutable audit trail logging all post-lock attendance edits, grade changes, and fee payment entries,  
> **So that** institutional governance and financial accountability are preserved.

* **Acceptance Criteria:**
  * **Given** a Finance Admin records a manual payment or a Principal overrides a locked attendance record,
  * **When** I inspect the Audit Log tab,
  * **Then** I see a chronological record showing `Timestamp`, `Actor Name & Role`, `Action Type`, `Target Entity`, and `Before → After` JSON diff.

### US-4.4: Deterministic Multi-Tenant Demo Seed & E2E Smoke Suite (Release Prep) — `6 pts`
> **As a** Product Owner / Portfolio Reviewer,  
> **I want** a one-command database seed script populating a realistic institution with pre-configured accounts for all 6 roles,  
> **So that** anyone testing CampusOS can immediately experience live schedules, attendance alerts, and fee dashboards.

* **Acceptance Criteria:**
  * **Given** a fresh database instance,
  * **When** the seed script executes,
  * **Then** it creates `Horizon Institute of Technology` (`tenant_id`), 4 departments, 15 rooms, 30 faculty, 500 students, 2 weeks of attendance history, active invoices, and 1-click demo login credentials for all 6 roles.

---

## Sprint Ceremonies & Engineering Practices

| Ceremony | Cadence | Outcome |
| :--- | :--- | :--- |
| Sprint planning | Day 1 | Selected stories fit ~28–32 pts capacity |
| Daily standup | Daily | Blockers, attendance/timetable integration risks |
| Backlog refinement | Mid-sprint | Next sprint API/schema drafts updated in `docs/` |
| Sprint review | Day 10 | Demo against seed tenant `horizon` |
| Retro | Day 10 | Action items (quality, perf, doc drift) |

**Definition of Done:** aligns with [`CampusOS_MVP_Scope.md`](./CampusOS_MVP_Scope.md) §6 plus OpenAPI drift check and Playwright smoke for the story’s happy path.

---

## Cross-Sprint Dependencies

```text
Sprint 1 (tenant, RBAC, academics)
    └── Sprint 2 requires sections, users, rooms
Sprint 2 (timetable, attendance)
    └── Sprint 3 requires published slots + sessions for grade context
Sprint 3 (grades, finance)
    └── Sprint 4 requires invoices + marks for dashboard KPIs
Sprint 4 (dashboards, seed, audit)
    └── Depends on all prior modules
```

---

## Risk Register (MVP)

| Risk | Mitigation |
| :--- | :--- |
| RLS misconfiguration | Integration tests for cross-tenant denial in Sprint 1 |
| Timetable race conditions | Transaction + optional advisory locks ([`ARCHITECTURE.md`](./ARCHITECTURE.md) §6.1) |
| Notification SLA misses | Outbox pattern + worker monitoring |
| Doc/API drift | Update [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) in same PR as endpoint changes |

---

## Related Documents

[`README.md`](./README.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) · [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) · [`UI.md`](./UI.md) · [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)