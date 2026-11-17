"use client";

import { useState } from "react";
import { ChevronsUpDown, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import type { AppRole } from "@/lib/types";
import { CampusOSLogo } from "@/components/brand/campusos-logo";
import { getNavItems } from "@/lib/nav-config";
import { CommandSearch } from "@/components/shell/command-search";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { UserMenu } from "@/components/shell/user-menu";
import { SidebarNav } from "@/components/shell/sidebar-nav";

function formatRole(role: AppRole) {
  return role.replaceAll("_", " ");
}

export function CommandBar() {
  const { user, switchRole } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.activeRole);
  const showRoleSwitcher = user.roles.length > 1;

  return (
    <header className="command-bar sticky top-0 z-30 border-b border-subtle bg-canvas/65 backdrop-blur-2xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:gap-4 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-xl lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 border-subtle bg-surface p-0">
            <SheetHeader className="border-b border-subtle px-4 py-5 text-left">
              <CampusOSLogo className="h-12 w-full max-w-[220px]" priority />
              <SheetTitle className="sr-only">Navigation</SheetTitle>
            </SheetHeader>
            <div className="px-3 py-4">
              <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <CommandSearch items={navItems} />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {showRoleSwitcher ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden h-10 gap-2 rounded-xl border border-subtle bg-surface/50 px-3 text-xs font-medium text-text-primary hover:border-accent-purple/35 hover:bg-surface sm:inline-flex"
                  >
                    <Shield className="h-4 w-4 text-accent-purple" />
                    <span className="max-w-[7rem] truncate">{formatRole(user.activeRole)}</span>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-text-secondary" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" sideOffset={8} className="w-52 border-subtle bg-surface">
                <DropdownMenuLabel>Active role</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={user.activeRole}
                  onValueChange={(value) => switchRole(value as AppRole)}
                >
                  {user.roles.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role}>
                      {formatRole(role)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <NotificationsMenu role={user.activeRole} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}