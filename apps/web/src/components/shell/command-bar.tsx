"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import type { AppRole } from "@/lib/types";
import { env } from "@/lib/env";

export function CommandBar() {
  const { user, switchRole, signOut } = useSession();

  if (!user) return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-subtle bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-cyan/10 text-xs font-bold text-accent-cyan">
          COS
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Horizon Institute</p>
          <p className="text-xs text-text-secondary">{env.appName}</p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="hidden max-w-xs flex-1 md:flex md:max-w-md lg:mx-8"
        type="button"
      >
        <Search className="h-4 w-4 text-text-secondary" />
        <span className="text-text-secondary">Command palette (Cmd+K)</span>
      </Button>

      <div className="flex items-center gap-2">
        {user.roles.length > 1 && (
          <div className="relative">
            <select
              className="h-9 appearance-none rounded-md border border-subtle bg-surface-hover px-3 pr-8 text-sm text-text-primary"
              value={user.activeRole}
              onChange={(e) => switchRole(e.target.value as AppRole)}
              aria-label="Switch active role"
            >
              {user.roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>
        )}

        <Button variant="ghost" size="icon" type="button" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-text-secondary">{user.activeRole}</p>
        </div>

        <Button variant="ghost" size="sm" type="button" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}