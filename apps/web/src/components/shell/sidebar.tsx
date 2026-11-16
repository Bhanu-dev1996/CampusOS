"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navByRole } from "@/lib/rbac";
import { useSession } from "@/hooks/use-session";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();

  if (!user) return null;

  const items = navByRole[user.activeRole];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-subtle bg-surface lg:block">
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}