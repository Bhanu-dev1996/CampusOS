"use client";

import { CampusOSLogo } from "@/components/brand/campusos-logo";
import { useSession } from "@/hooks/use-session";
import { getNavItems } from "@/lib/nav-config";
import { SidebarNav } from "@/components/shell/sidebar-nav";

export function Sidebar() {
  const { user, isHydrated } = useSession();
  if (!isHydrated || !user) return null;

  const items = getNavItems(user.activeRole);

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-subtle bg-surface/80 backdrop-blur-xl lg:flex">
      <div className="border-b border-subtle px-4 py-5">
        <CampusOSLogo className="h-14 w-full max-w-[220px]" priority fetchPriority="high" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-text-secondary uppercase">
          Workspace
        </p>
        <SidebarNav items={items} />
      </div>
    </aside>
  );
}