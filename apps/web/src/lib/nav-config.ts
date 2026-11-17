import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Receipt,
  ScrollText,
  Settings2,
  Wallet,
} from "lucide-react";

import type { AppRole } from "@/lib/types";
import { navByRole } from "@/lib/rbac";

const iconsByHref: Record<string, LucideIcon> = {
  "/platform/tenants": Building2,
  "/dashboard": LayoutDashboard,
  "/academics": GraduationCap,
  "/timetable/builder": Settings2,
  "/timetable": Calendar,
  "/announcements": Megaphone,
  "/audit": ScrollText,
  "/attendance/today": ClipboardCheck,
  "/assignments": FileText,
  "/grades": GraduationCap,
  "/finance/invoices": Receipt,
  "/finance/templates": Wallet,
};

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function getNavItems(role: AppRole): NavItem[] {
  return navByRole[role].map((item) => ({
    ...item,
    icon: iconsByHref[item.href] ?? LayoutDashboard,
  }));
}

export function institutionLabel(role: AppRole): string {
  return role === "SUPER_ADMIN" ? "CampusOS Platform" : "Horizon Institute";
}

export function getPageTitle(pathname: string, role: AppRole): string {
  const items = getNavItems(role);
  const match = items
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (match) return match.label;

  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "Home";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}