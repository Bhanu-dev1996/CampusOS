"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppRole } from "@/lib/types";
import {
  formatNotificationTime,
  loadReadIds,
  notificationsForRole,
  saveReadIds,
  type AppNotification,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const kindDot: Record<AppNotification["kind"], string> = {
  info: "bg-accent-blue",
  success: "bg-status-success",
  warning: "bg-status-warning",
};

export function NotificationsMenu({ role }: { role: AppRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => notificationsForRole(role), [role]);

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  const persistRead = useCallback((next: Set<string>) => {
    setReadIds(next);
    saveReadIds(next);
  }, []);

  function markRead(id: string) {
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  }

  function markAllRead() {
    persistRead(new Set(items.map((n) => n.id)));
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="relative h-10 w-10 rounded-xl border border-subtle bg-surface/50 hover:border-accent-cyan/30 hover:bg-surface"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-cyan px-1 text-[9px] font-semibold text-canvas ring-2 ring-surface">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 border-subtle bg-surface p-0"
      >
        <div className="flex items-center justify-between border-b border-subtle px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-text-primary">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-accent-cyan"
              onClick={markAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-text-secondary">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto p-1">
            {items.map((notification) => {
              const unread = !readIds.has(notification.id);
              const content = (
                <>
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      kindDot[notification.kind],
                      !unread && "opacity-40",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        unread ? "font-medium text-text-primary" : "text-text-secondary",
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-text-secondary">
                      {notification.body}
                    </span>
                    <span className="mt-1 block text-[10px] text-text-secondary">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={notification.id}>
                  <DropdownMenuItem
                    className="items-start gap-2 rounded-lg px-2 py-2"
                    onClick={() => {
                      markRead(notification.id);
                      if (notification.href) {
                        setOpen(false);
                        router.push(notification.href);
                      }
                    }}
                  >
                    {content}
                  </DropdownMenuItem>
                </li>
              );
            })}
          </ul>
        )}

        <DropdownMenuSeparator className="m-0" />
        <p className="px-3 py-2 text-[10px] text-text-secondary">
          Demo alerts until the notifications API is connected.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}