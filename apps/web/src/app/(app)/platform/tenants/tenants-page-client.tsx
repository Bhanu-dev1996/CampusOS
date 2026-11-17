"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TenantCreateSheet } from "@/components/platform/tenant-create-sheet";
import { TenantRegistry } from "@/components/platform/tenant-registry";
import { useSession } from "@/hooks/use-session";
import { ApiError } from "@/lib/api-client";
import {
  createTenant,
  listTenants,
  type TenantCreated,
  type TenantCreateInput,
} from "@/lib/platform";
import { roleHomePath } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default function TenantsPageClient() {
  const { user, accessToken, isHydrated, signOut } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<TenantCreated | null>(null);

  const isSuperAdmin = user?.activeRole === "SUPER_ADMIN";

  useEffect(() => {
    if (user && user.activeRole !== "SUPER_ADMIN") {
      router.replace(roleHomePath[user.activeRole]);
    }
  }, [user, router]);

  const canLoadTenants = isHydrated && isSuperAdmin && Boolean(accessToken);

  const tenantsQuery = useQuery({
    queryKey: ["platform", "tenants"],
    queryFn: listTenants,
    enabled: canLoadTenants,
    retry: (failureCount, err) =>
      !(err instanceof ApiError && err.status === 401) && failureCount < 1,
  });

  useEffect(() => {
    if (
      tenantsQuery.isError &&
      tenantsQuery.error instanceof ApiError &&
      tenantsQuery.error.status === 401
    ) {
      toast.error("Your session expired. Please sign in again.");
      signOut();
      router.replace("/login");
    }
  }, [tenantsQuery.isError, tenantsQuery.error, signOut, router]);

  const createMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: (data) => {
      setLastCreated(data);
      queryClient.invalidateQueries({ queryKey: ["platform", "tenants"] });
      toast.success(`Created ${data.name}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not create tenant");
    },
  });

  function onCreate(values: TenantCreateInput) {
    createMutation.mutate(values);
  }

  return (
    <div className="space-y-4">
      {!isSuperAdmin ? (
        <p className="text-sm text-text-secondary" role="status">
          Redirecting to your workspace…
        </p>
      ) : null}

      <div className={cn("space-y-4", !isSuperAdmin && "hidden")} aria-hidden={!isSuperAdmin}>
        <div className="flex justify-end">
          <Button
            type="button"
            className="text-sm font-medium sm:text-base sm:font-semibold"
            onClick={(e) => {
              setLastCreated(null);
              setSheetOpen(true);
              e.currentTarget.blur();
            }}
          >
            <Plus className="h-4 w-4" />
            Create institution
          </Button>
        </div>

        <TenantRegistry
          tenants={tenantsQuery.data}
          isLoading={tenantsQuery.isLoading}
          isError={tenantsQuery.isError}
        />

        <TenantCreateSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          isPending={createMutation.isPending}
          lastCreated={lastCreated}
          onClearCreated={() => setLastCreated(null)}
          onSubmit={onCreate}
        />
      </div>
    </div>
  );
}