"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { useSession } from "@/hooks/use-session";
import { canAccessPath, roleHomePath } from "@/lib/rbac";
import { cn } from "@/lib/utils";

function GateMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center text-text-secondary">
      {children}
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isHydrated } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const routeAllowed =
    isHydrated && user ? canAccessPath(user.activeRole, pathname) : false;
  const showPage = isHydrated && user && routeAllowed;

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
    }
  }, [user, isHydrated, router]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    if (!canAccessPath(user.activeRole, pathname)) {
      router.replace(roleHomePath[user.activeRole]);
    }
  }, [user, isHydrated, pathname, router]);

  return (
    <AppShell>
      {!isHydrated ? (
        <GateMessage>Loading session…</GateMessage>
      ) : !user ? (
        <GateMessage>Redirecting to sign in…</GateMessage>
      ) : !routeAllowed ? (
        <GateMessage>Redirecting to your workspace…</GateMessage>
      ) : null}

      {/* Keep child segments in the tree so Next.js can validate instant navigation. */}
      <div
        className={cn(!showPage && "hidden")}
        aria-hidden={!showPage}
        suppressHydrationWarning
      >
        {children}
      </div>
    </AppShell>
  );
}