"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function SidebarNav({
  items,
  onNavigate,
  className,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent-cyan/10 text-accent-cyan"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
            )}
          >
            {active ? (
              <span
                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent-cyan"
                aria-hidden
              />
            ) : null}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-accent-cyan" : "text-text-secondary group-hover:text-text-primary",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}