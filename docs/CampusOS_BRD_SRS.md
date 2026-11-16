# Business Requirements Document (BRD) & Software Requirements Specification (SRS)

**Project Name:** CampusOS – Multi-Tenant Enterprise Education ERP  
**Document Version:** 1.1  
**Author:** Senior Business Analyst  
**Status:** Baseline Approved  

---

## 1. Executive Summary

### 1.1 Purpose
The purpose of this document is to define the business, functional, and technical requirements for **CampusOS**, a multi-tenant Software-as-a-Service (SaaS) Enterprise Resource Planning (ERP) platform built for schools, colleges, and universities. Unlike basic Student Information Systems (SIS) that act as simple CRUD repositories, CampusOS unifies academic delivery, timetable constraint solving, real-time attendance telemetry, examination seat allocation, and double-entry financial accounting into one centralized system.

### 1.2 Scope
This specification covers:
* Multi-tenant SaaS provisioning and tenant data isolation.
* Role-Based Access Control (RBAC) across six primary institutional personas.
* Six core operational modules: Academic & Curriculum Engine, Smart Attendance, Timetable & Exam Scheduler, Double-Entry Fee Ledger, Assessment & Gradebook, and Unified Communication Hub.
* Critical business rules, financial edge cases, and non-functional enterprise SLAs.

---

## 2. Business Context & Problem Statement

### 2.1 Baseline Institutional Profile
To anchor system scale and performance requirements, CampusOS is modeled against a mid-to-large private educational institution with the following operational footprint:
* **Students:** 5,000 active enrollments
* **Staff:** 250 teaching faculty and administrative/non-teaching personnel
* **Physical Infrastructure:** 100 classrooms, laboratories, and lecture halls
* **Academic Structure:** 12 departments across multiple degree/grade programs
* **External Stakeholders:** 3,000+ parent/guardian accounts

### 2.2 Operational Pain Points & Objectives

| ID | Legacy Operational Pain Point | CampusOS Business Objective | Target KPI / Success Metric |
| :--- | :--- | :--- | :--- |
| **BO-01** | Student records are fragmented across siloed spreadsheets and legacy tools. | Establish a single source of truth for the entire student lifecycle (`Admission → Alumni`). | 100% unified student profile accuracy across all 12 departments. |
| **BO-02** | Faculty take attendance on paper/disparate tools, delaying administrative visibility. | Digitize attendance via 1-tap mobile/web rosters and biometric/RFID webhooks. | $< 5\text{ minutes}$ latency from class roll call to parent absence alert. |
| **BO-03** | Parents lack real-time visibility into grades, attendance, and dues. | Provide a dedicated self-service Parent Portal with push/SMS alerts and online payments. | $> 85\%$ active monthly parent engagement. |
| **BO-04** | Manual fee tracking causes revenue leakage and reconciliation errors. | Implement an immutable, double-entry student fee ledger with gateway webhooks. | $35\%$ faster fee recovery within the first 30 days of each term. |
| **BO-05** | Manual scheduling causes room collisions and faculty double-booking. | Deploy a constraint-satisfaction engine for timetables and exam hall matrices. | $0$ scheduling collisions across 100 rooms and 250 staff. |
| **BO-06** | Leadership lacks consolidated cross-departmental analytics. | Deliver real-time executive dashboards for attendance, pass rates, and cash flow. | $80\%$ reduction in manual report compilation hours. |

---

## 3. Stakeholder Personas & RBAC Matrix

### 3.1 User Personas

1. **Super Administrator (Platform Owner):** Manages SaaS tenant onboarding, subscription tiers, feature flags, global master configurations, and cross-tenant telemetry.
2. **Principal / Institution Admin:** Oversees institutional operations, department hierarchies, staff assignments, academic calendars, policy approvals, and executive analytics.
3. **Faculty:** Manages assigned classes, daily attendance, coursework/assignments, internal/external grading, and student performance mentoring.
4. **Student:** Views personal timetables, real-time attendance percentages, assignments, exam hall tickets, transcripts, and fee statements.
5. **Parent / Guardian:** Monitors linked children's attendance, academic progress, disciplinary/institutional notices, and executes online fee payments.
6. **Finance Administrator:** Configures fee templates, scholarships/waivers, installment schedules, refund approvals, and daily payment gateway reconciliations.

### 3.2 Role-Based Access Control (RBAC) Permission Matrix

*Legend: **C** = Create, **R** = Read, **U** = Update, **D** = Delete, **A** = Approve, **—** = No Access*

| Resource / Module | Super Admin | Principal / Admin | Faculty | Student | Parent / Guardian | Finance Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tenant & Subscription Config** | C, R, U, D | R (Own Tenant) | — | — | — | — |
| **Department & Program Setup** | — | C, R, U, D | R | R | — | R |
| **Student Master Profiles** | — | C, R, U, D | R (Assigned) | R (Self) | R (Linked Child) | R (Billing Info) |
| **Timetable & Room Allocation** | — | C, R, U, D, A | R (Own) | R (Own) | R (Linked Child) | — |
| **Daily Class Attendance** | — | R, U, A | C, R, U (Window) | R (Self) | R (Linked Child) | — |
| **Assignments & Assessments** | — | R, A | C, R, U, D | R, U (Submit) | R (Linked Child) | — |
| **Official Exam Grades / Transcripts** | — | R, U, A | C, R, U (Draft) | R (Published) | R (Published) | — |
| **Fee Structures & Invoices** | — | R, A | — | R (Self) | R (Linked Child) | C, R, U, A |
| **Payments, Receipts & Refunds** | — | R, A (Refunds) | — | C (Pay), R | C (Pay), R | C, R, U, A |
| **Institutional Announcements** | C (Global) | C, R, U, D | C (Class Scope) | R | R | C (Fee Alerts) |

*Note: CampusOS supports **Composite Roles**. A single authenticated identity may hold multiple roles simultaneously (e.g., a Faculty member who is also a Department Head and a Parent) and switch contexts without re-authenticating.*

---

## 4. Functional Requirements

### 4.1 Module 1: Multi-Tenant Core & Identity Management
* **FR-1.1 (Tenant Provisioning):** The system shall allow Super Admins to provision new institutional workspaces with isolated configurations, custom subdomains (`{institution}.campusos.io`), branding, and academic year cycles.
* **FR-1.2 (Strict Tenant Isolation):** Every database entity belonging to an institution shall be tagged with a mandatory `tenant_id` enforced at the database layer via PostgreSQL Row-Level Security (RLS).
* **FR-1.3 (Multi-Role Context Switching):** Users with multiple assigned roles or linked student profiles (e.g., parents with two enrolled children) shall be able to switch active views seamlessly via the UI context switcher.
* **FR-1.4 (Immutable Audit Trail):** All create, update, and delete operations on grades, attendance overrides, and financial transactions must write an immutable log capturing `actor_id`, `role`, `timestamp`, `ip_address`, `before_state`, and `after_state`.

### 4.2 Module 2: Academic & Curriculum Engine
* **FR-2.1 (Hierarchical Modeling):** The system shall support configurable multi-level academic structures: `Institution → Department → Program (e.g., B.Tech CS) → Batch (e.g., 2024–2028) → Semester/Term → Section`.
* **FR-2.2 (Course & Credit Mapping):** Admins shall define Core, Elective, and Lab courses with credit weights, minimum attendance thresholds (default: $75\%$), and prerequisite rules.
* **FR-2.3 (Lifecycle Progression):** The system shall support bulk student promotion, section shuffling, detention/backlogs, and alumni archival at the conclusion of an academic term.

### 4.3 Module 3: Smart Attendance & Biometric Telemetry
* **FR-3.1 (Multi-Modal Capture):** Faculty shall mark class attendance via web or mobile interfaces in under 30 seconds using a default-present toggle pattern (`Present`, `Absent`, `Late`, `Excused`).
* **FR-3.2 (Hardware Ingestion API):** The system shall expose secure webhook endpoints to ingest punch logs from RFID cards, biometric scanners, or smart classroom beacons.
* **FR-3.3 (Edit Lock Window):** Faculty may edit submitted attendance records within a configurable grace period (e.g., 24 hours). Post-lock modifications require Principal/Admin approval.
* **FR-3.4 (Automated Escalation):** Within 5 minutes of session attendance submission, the system shall cross-check unexcused absences against approved leave requests and dispatch automated SMS/push alerts to linked Parents.
* **FR-3.5 (Shortage Threshold Alerts):** Automated warnings shall be triggered to Students, Parents, and Advisors when a student's cumulative attendance drops below $80\%$ (Warning) and $75\%$ (Exam Debarment Risk).

### 4.4 Module 4: Conflict-Free Timetable & Exam Scheduler
* **FR-4.1 (Constraint Validation Engine):** When generating or modifying weekly class schedules, the system shall enforce hard constraints:
  1. No classroom assigned to two sessions simultaneously.
  2. Room seating capacity $\ge$ enrolled section/elective headcount.
  3. No faculty member scheduled for overlapping periods or exceeding maximum daily teaching hours.
  4. No overlapping slots for students enrolled in cross-departmental electives.
* **FR-4.2 (Substitute Faculty Allocation):** When a faculty member logs an approved leave, the system shall recommend available substitute faculty from the same department who have free periods during affected slots.
* **FR-4.3 (Exam Hall Seat Matrix Generator):** For mid-term and final exams, the system shall ingest course schedules and room capacities to automatically generate anti-cheating seating matrices (interleaving students from different courses on alternate seats) and printable hall tickets.

### 4.5 Module 5: Double-Entry Fee Ledger & Finance Suite
* **FR-5.1 (Modular Fee Templates):** Finance Admins shall build fee structures composed of granular line items (Tuition, Lab, Library, Transport, Hostel) mapped to specific Programs, Batches, and Student Categories.
* **FR-5.2 (Double-Entry Ledger Architecture):** All financial events (invoice generation, scholarship waivers, partial payments, late fines, refunds) must be recorded as balanced debit/credit journal entries. Invoices cannot be silently overwritten once issued; adjustments require Credit/Debit Memos.
* **FR-5.3 (Installment & Late-Fee Rules):** The system shall support split payment schedules with automated late-fee accrual rules (flat fee or daily percentage) after due dates.
* **FR-5.4 (Payment Gateway Reconciliation):** Integration with payment gateways (Stripe/Razorpay) via idempotent webhooks to automatically mark invoices `PAID` or `PARTIALLY_PAID` and generate sequential tax-compliant PDF receipts.

### 4.6 Module 6: Assessment, Gradebook & Transcripts
* **FR-6.1 (Configurable Grading Schemas):** Support multiple evaluation models per program, including 10-point CGPA, 4.0 GPA, Percentage, and Relative Letter Grading.
* **FR-6.2 (Weighted Component Aggregation):** Faculty shall input marks across configurable components (e.g., `Internal Quizzes 20% + Mid-Term 30% + Final Exam 50%`), with automated rounding and pass/fail boundary checks.
* **FR-6.3 (Moderation & Publication Workflow):** Grades follow a strict state machine: `DRAFT (Faculty) → VERIFIED (Department Head) → PUBLISHED (Principal/Exam Controller)`. Students and Parents can only view `PUBLISHED` grades.
* **FR-6.4 (Verifiable Transcripts):** One-click generation of official semester grade cards and consolidated transcripts embedded with a cryptographic QR verification code.

### 4.7 Module 7: Unified Communication Hub & Analytics
* **FR-7.1 (Targeted Broadcasting):** Authorized users shall send announcements scoped by Role, Department, Batch, Section, or Fee Defaulter status via In-App Notification, Email, and SMS.
* **FR-7.2 (Read-Receipt Tracking):** High-priority institutional circulars shall log delivery and read timestamps per recipient.
* **FR-7.3 (Executive Command Dashboard):** Real-time visualizations for leadership displaying daily institutional attendance %, fee collection vs. outstanding receivables, department-wise exam pass rates, and room utilization metrics.

---

## 5. Key Business Rules & Edge-Case Handling

| Rule ID | Domain | Scenario / Edge Case | Required System Behavior |
| :--- | :--- | :--- | :--- |
| **BR-01** | Finance | **Mid-Term Scholarship Grant:** A student receives a 25% merit waiver *after* an invoice is issued and 50% is already paid. | System issues a Credit Memo for 25% of the gross fee, offsets the remaining unpaid balance, and places any excess credit into an `Advance Wallet` for the next term. |
| **BR-02** | Finance | **Duplicate Webhook Delivery:** Payment gateway sends the same `payment.succeeded` webhook twice due to network retry. | System checks the unique `idempotency_key` / `gateway_transaction_id`, ignores the duplicate event, and prevents double-crediting the student ledger. |
| **BR-03** | Academics | **Mid-Semester Section Transfer:** A student transfers from Section A to Section B in Week 6. | Historical attendance and assignment scores from Section A are preserved and merged into the student's cumulative course totals in Section B without data loss. |
| **BR-04** | Scheduling | **Emergency Room Closure:** A laboratory becomes unavailable due to maintenance. | System flags all impacted sessions, highlights alternative rooms meeting capacity/equipment criteria, and notifies affected faculty and students upon reassignment. |
| **BR-05** | Examinations | **Attendance Debarment Override:** A student has 68% attendance (below 75% threshold) due to documented medical hospitalization. | System blocks hall ticket generation by default, but allows Principal/Dean to execute a logged `Medical Condonation Override` with attached proof. |

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Performance & Scalability
* **API Latency:** $95\%$ of standard read/write API requests shall respond in $< 200\text{ ms}$ under normal load.
* **Peak Concurrency:** System must handle burst traffic without degradation—specifically $1,500+$ concurrent parent logins during exam result publication and $250+$ simultaneous faculty attendance submissions at 9:00 AM.
* **Asynchronous Processing:** Heavy batch operations (generating 5,000 invoices, compiling PDF transcripts, dispatching bulk SMS alerts) must execute via background job queues without blocking the UI.

### 6.2 Security & Compliance
* **Authentication:** OAuth 2.0 / OIDC compliant authentication with optional Multi-Factor Authentication (MFA) enforced for Principal, Finance Admin, and Super Admin roles.
* **Encryption:** TLS 1.3 for all data in transit; AES-256 encryption for sensitive PII and financial records at rest.
* **Data Privacy:** Compliance with FERPA / GDPR / DPDP data minimization principles, including automated PII masking in non-production environments and right-to-export student records.

### 6.3 Availability & Disaster Recovery
* **Uptime SLA:** $99.9\%$ availability during core academic hours (07:00 – 20:00 local institution time).
* **Backup & Recovery:** Automated daily point-in-time database snapshots with a Recovery Point Objective (**RPO**) of $< 15\text{ minutes}$ and Recovery Time Objective (**RTO**) of $< 2\text{ hours}$.

---

## 7. Release Roadmap & Prioritization (MoSCoW)

* **Phase 1 – Foundation & Core Operations (MVP):**
  * Multi-tenant workspace provisioning & RBAC engine
  * Academic hierarchy & Student/Staff master directories
  * Smart Attendance with parent absence alerts
  * Basic Timetable management
* **Phase 2 – Financial & Evaluation Engine:**
  * Double-entry Fee Ledger, installment plans, & payment gateway integration
  * Assessment Gradebook, GPA calculation, & PDF Transcripts
* **Phase 3 – Enterprise Optimization & Hardware:**
  * Automated Exam Hall Seating Matrix algorithm
  * RFID/Biometric hardware webhook connectors
  * Executive Predictive Analytics (dropout/attendance risk scoring)

---

## 8. Traceability & Related Documents

| Artifact | Location |
| :--- | :--- |
| MVP scope boundary | [`CampusOS_MVP_Scope.md`](./CampusOS_MVP_Scope.md) |
| Sprint backlog | [`CampusOS_Agile_Sprint_Plan.md`](./CampusOS_Agile_Sprint_Plan.md) |
| Architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| API contracts | [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) |
| Data model | [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) |
| UI implementation | [`UI.md`](./UI.md) |

### Attendance threshold alignment (MVP)

* **FR-3.5** defines an **80%** early-warning band and **75%** exam-debarment risk.
* **MVP UI/API** MUST surface the **75%** shortage badge as the primary blocking signal; the **80%** warning MAY display as amber “watch” state where noted in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
