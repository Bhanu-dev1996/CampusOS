"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Tenant } from "@/lib/platform";

function formatCreatedAt(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

function loginHost(subdomain: string) {
  return `${subdomain}.campusos.io`;
}

export function TenantRegistry({
  tenants,
  isLoading,
  isError,
}: {
  tenants: Tenant[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return <p className="py-12 text-center text-text-secondary">Loading…</p>;
  }

  if (isError) {
    return <p className="py-12 text-center text-destructive">Could not load tenants.</p>;
  }

  const rows = tenants ?? [];

  if (rows.length === 0) {
    return <p className="py-12 text-center text-text-secondary">No tenants yet.</p>;
  }

  const totalUsers = rows.reduce((sum, t) => sum + (t.user_count ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
        <span>
          <span className="font-mono-tabular font-medium text-text-primary">{rows.length}</span>{" "}
          institutions
        </span>
        <span>
          <span className="font-mono-tabular font-medium text-text-primary">{totalUsers}</span>{" "}
          provisioned users
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-subtle bg-surface/80">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Institution</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead className="hidden lg:table-cell">Login URL</TableHead>
              <TableHead className="hidden md:table-cell">Principal</TableHead>
              <TableHead className="hidden sm:table-cell">Users</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="hidden xl:table-cell">Timezone</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id} className="border-subtle">
                <TableCell className="min-w-[140px] font-medium text-text-primary md:font-semibold">
                  <div>{t.name}</div>
                  {t.principal_name ? (
                    <p className="mt-0.5 text-xs font-normal text-text-secondary md:hidden">
                      {t.principal_name}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <code className="rounded-md bg-surface-hover px-2 py-0.5 font-mono text-xs text-accent-cyan">
                    {t.subdomain}
                  </code>
                  <p className="mt-1 font-mono text-[10px] text-text-secondary lg:hidden">
                    {loginHost(t.subdomain)}
                  </p>
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-text-secondary lg:table-cell">
                  {loginHost(t.subdomain)}
                </TableCell>
                <TableCell className="hidden max-w-[200px] md:table-cell">
                  {t.principal_email ? (
                    <div className="truncate">
                      <p className="truncate text-sm text-text-primary">
                        {t.principal_name ?? "Principal"}
                      </p>
                      <p className="truncate text-xs text-text-secondary">{t.principal_email}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden font-mono-tabular sm:table-cell">
                  {t.user_count ?? 0}
                </TableCell>
                <TableCell className="font-mono-tabular whitespace-nowrap">{t.academic_year}</TableCell>
                <TableCell className="hidden text-xs text-text-secondary xl:table-cell">
                  {t.timezone}
                </TableCell>
                <TableCell className="hidden font-mono-tabular text-text-secondary md:table-cell">
                  {formatCreatedAt(t.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className="border-status-success/35 bg-status-success/10 text-[10px] text-status-success"
                  >
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}