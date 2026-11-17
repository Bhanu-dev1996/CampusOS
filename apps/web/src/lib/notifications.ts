import type { AppRole } from "@/lib/types";

export type NotificationKind = "info" | "success" | "warning";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  kind: NotificationKind;
  href?: string;
}

const STORAGE_KEY = "campusos.notification.read";

const catalogByRole: Record<AppRole, AppNotification[]> = {
  SUPER_ADMIN: [
    {
      id: "platform-tenant-ready",
      title: "Tenant onboarding ready",
      body: "Horizon Institute principal invite is pending delivery.",
      createdAt: "2025-11-16T08:30:00.000Z",
      kind: "info",
      href: "/platform/tenants",
    },
    {
      id: "platform-rls",
      title: "RLS policies active",
      body: "Tenant isolation is enforced on users, roles, departments, and invoices.",
      createdAt: "2025-11-16T07:15:00.000Z",
      kind: "success",
    },
  ],
  PRINCIPAL: [
    {
      id: "attendance-dip",
      title: "Attendance below target",
      body: "Block B averaged 76% yesterday — review absentee list.",
      createdAt: "2025-11-16T06:00:00.000Z",
      kind: "warning",
      href: "/dashboard",
    },
    {
      id: "fee-collection",
      title: "Term fee collection",
      body: "₹1.25 Cr collected this term; ₹32 L outstanding.",
      createdAt: "2025-11-16T05:00:00.000Z",
      kind: "info",
      href: "/dashboard",
    },
  ],
  FACULTY: [
    {
      id: "attendance-reminder",
      title: "Mark today’s attendance",
      body: "CS301 session ends in 45 minutes.",
      createdAt: "2025-11-16T09:00:00.000Z",
      kind: "warning",
      href: "/attendance/today",
    },
  ],
  STUDENT: [
    {
      id: "assignment-due",
      title: "Assignment due tomorrow",
      body: "Data Structures lab report — submit before 5:00 PM.",
      createdAt: "2025-11-16T08:00:00.000Z",
      kind: "warning",
      href: "/assignments",
    },
  ],
  PARENT: [
    {
      id: "fee-due",
      title: "Fee installment due",
      body: "Term 2 installment is due in 5 days.",
      createdAt: "2025-11-16T07:00:00.000Z",
      kind: "warning",
      href: "/finance/invoices",
    },
  ],
  FINANCE_ADMIN: [
    {
      id: "invoices-pending",
      title: "Invoices pending approval",
      body: "12 draft invoices await review before send.",
      createdAt: "2025-11-16T08:45:00.000Z",
      kind: "info",
      href: "/finance/invoices",
    },
  ],
};

export function notificationsForRole(role: AppRole): AppNotification[] {
  return catalogByRole[role] ?? [];
}

export function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function saveReadIds(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function formatNotificationTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}