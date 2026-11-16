# CampusOS — UI/UX Design System & Tokens

**Version:** 1.1  
**Theme:** Dark mode first (light mode deferred post-MVP)  
**Implementation:** Tailwind CSS v4 CSS variables + shadcn/ui  
**Related:** [`UI.md`](./UI.md)

---

## 1. Visual Direction: Enterprise Command Center

CampusOS avoids cluttered legacy ERP layouts in favor of a **high-contrast dark command interface** for rapid scanning, unambiguous status color, and dense operational grids.

---

## 2. Color Tokens

Define in `apps/web/src/app/globals.css` inside `@theme`:

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#090D16` | App background |
| `--bg-surface` | `#111827` | Cards, tables, sidebar |
| `--bg-surface-hover` | `#1E293B` | Row hover, active nav |
| `--border-subtle` | `rgba(148, 163, 184, 0.14)` | Dividers |
| `--accent-cyan` | `#00F0FF` | KPI highlights, charts |
| `--accent-blue` | `#3B82F6` | Primary CTAs |
| `--accent-purple` | `#A855F7` | Role badges, switcher |
| `--status-success` | `#10B981` | Present, paid |
| `--status-warning` | `#F59E0B` | Partial pay, 75–79% attendance |
| `--status-danger` | `#EF4444` | Absent, unpaid overdue, &lt;75% |
| `--text-primary` | `#F8FAFC` | Headings, values |
| `--text-secondary` | `#94A3B8` | Labels, meta |

### Elevation & glow

* KPI / modal: `box-shadow: 0 0 20px rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.25);`
* Conflict alert: `0 0 16px rgba(239, 68, 68, 0.2)` border on timetable cells.

---

## 3. Typography

| Role | Font | Notes |
| :--- | :--- | :--- |
| UI | Inter | `font-sans` |
| Data / IDs | JetBrains Mono | Roll numbers, invoice IDs, time slots |
| Numerals | Tabular | `font-variant-numeric: tabular-nums` on tables |

**Scale (rem):** `xs 0.75`, `sm 0.875`, `base 1`, `lg 1.125`, `xl 1.25`, `2xl 1.5`, `3xl 1.875`

---

## 4. Spacing & Layout Grid

* Base unit: **4px** (Tailwind default).
* Page max width: `1440px` with `24px` horizontal padding on mobile, `32px` on desktop.
* Command bar height: `56px`.
* Sidebar: `240px` expanded / `68px` collapsed.

---

## 5. Navigation Architecture

1. **Top command bar:** institution badge, composite role switcher, `Cmd+K` palette, notifications, profile.
2. **Left rail:** role-filtered links (see [`UI.md`](./UI.md) route map).
3. **Content:** role-specific landing dashboards.

---

## 6. Components (shadcn/ui mapping)

| Pattern | shadcn component | Notes |
| :--- | :--- | :--- |
| Primary action | `Button` variant `default` | Blue accent |
| Destructive | `Button` variant `destructive` | Overrides, deletes |
| Data grids | `Table` + TanStack Table | Sticky header, zebra optional |
| Filters | `Badge`, `ToggleGroup` | Finance invoice chips |
| Forms | `Form` + `Input`, `Select` | Zod resolver |
| Overlays | `Sheet`, `Dialog` | Payment drawer, conflict modal |
| Status | Custom `StatusPill` | Maps attendance/fee enums |
| Charts | Recharts in `Card` | Principal dashboard |
| Toast | `Sonner` | Save confirmations, errors |

### Status pills

| State | Background | Text |
| :--- | :--- | :--- |
| Present / Paid | `status-success/15` | `status-success` |
| Late / Partial | `status-warning/15` | `status-warning` |
| Absent / Overdue | `status-danger/15` | `status-danger` |

---

## 7. Role-Adaptive Landing Views

| Role | Layout |
| :--- | :--- |
| Principal | 4 KPI cards + dept attendance bar + fee donut + alert feed |
| Faculty | Vertical timeline of today's classes + roll call CTA |
| Finance | TanStack invoice ledger + quick filters + payment sheet |
| Student / Parent | Attendance gauge (75% marker), timetable card, pay dues CTA |

---

## 8. Motion

* Micro-interactions: `150–200ms` ease-out (buttons, toggles).
* Page transitions: subtle fade only; avoid distracting motion on data tables.
* Respect `prefers-reduced-motion`: disable non-essential animations.

---

## 9. Accessibility (WCAG 2.1 AA targets)

* Minimum contrast **4.5:1** for body text on surfaces (verify cyan accents on large text only).
* Full keyboard navigation for attendance toggle grid (`Space` toggle, `Enter` submit).
* Focus rings: `ring-2 ring-accent-cyan ring-offset-2 ring-offset-bg-canvas`.
* Icon-only controls require `aria-label`.
* Live regions for toast notifications and attendance submit result.

---

## 10. Responsive Breakpoints

| Breakpoint | Behavior |
| :--- | :--- |
| `< 768px` | Sidebar collapses to icons; tables become card lists where noted in UI spec |
| `768–1024px` | 2-column dashboard grid |
| `≥ 1024px` | Full command center layout |

---

## 11. Content & Tone

* Error copy: state **what failed**, **why**, and **next step** (mirror API `error.message`).
* Empty states: one-line explanation + primary CTA (e.g., "No invoices yet — Generate batch").
* Currency: locale `en-IN`, `₹` prefix, 2 decimal places in mono font.