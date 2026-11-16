import type { AppRole } from "@/lib/types";

/** MVP path prefixes each role may access (middleware + sidebar). */
export const roleHomePath: Record<AppRole, string> = {
  SUPER_ADMIN: "/platform/tenants",
  PRINCIPAL: "/dashboard",
  FACULTY: "/attendance/today",
  STUDENT: "/timetable",
  PARENT: "/timetable",
  FINANCE_ADMIN: "/finance/invoices",
};

export const navByRole: Record<
  AppRole,
  { href: string; label: string }[]
> = {
  SUPER_ADMIN: [{ href: "/platform/tenants", label: "Tenants" }],
  PRINCIPAL: [
    { href: "/dashboard", label: "Command Center" },
    { href: "/academics", label: "Academics" },
    { href: "/timetable/builder", label: "Timetable" },
    { href: "/announcements", label: "Announcements" },
    { href: "/audit", label: "Audit Log" },
  ],
  FACULTY: [
    { href: "/attendance/today", label: "Take Attendance" },
    { href: "/timetable", label: "My Schedule" },
    { href: "/assignments", label: "Assignments" },
  ],
  STUDENT: [
    { href: "/timetable", label: "Timetable" },
    { href: "/grades", label: "Grades" },
    { href: "/finance/invoices", label: "Fees" },
  ],
  PARENT: [
    { href: "/timetable", label: "Child Schedule" },
    { href: "/grades", label: "Progress" },
    { href: "/finance/invoices", label: "Pay Dues" },
  ],
  FINANCE_ADMIN: [
    { href: "/finance/invoices", label: "Invoices" },
    { href: "/finance/templates", label: "Fee Templates" },
    { href: "/audit", label: "Audit Log" },
  ],
};

export function canAccessPath(role: AppRole, pathname: string): boolean {
  const allowedPrefixes = [
    ...navByRole[role].map((n) => n.href),
    "/settings",
  ];
  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}