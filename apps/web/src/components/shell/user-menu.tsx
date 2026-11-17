"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import type { AppRole } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: AppRole) {
  return role.replaceAll("_", " ");
}

export function UserMenu() {
  const router = useRouter();
  const { user, switchRole, signOut } = useSession();

  if (!user) return null;

  const showRoleSwitcher = user.roles.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border border-subtle bg-surface/50 p-0 hover:border-accent-cyan/30 hover:bg-surface"
            aria-label="Account menu"
          >
            <Avatar size="sm" className="size-8">
              <AvatarFallback className="bg-gradient-to-br from-accent-cyan/25 to-accent-blue/20 text-[11px] font-semibold text-accent-cyan">
                {initials(user.fullName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 border-subtle bg-surface p-1"
      >
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <p className="text-sm font-semibold text-text-primary">{user.fullName}</p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">{user.email}</p>
        </DropdownMenuLabel>
        {showRoleSwitcher ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-text-secondary">
              Switch role
            </DropdownMenuLabel>
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
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-lg"
          onClick={() => {
            signOut();
            router.replace("/login");
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}