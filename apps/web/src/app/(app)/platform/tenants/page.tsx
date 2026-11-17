import { Suspense } from "react";
import TenantsPageClient from "./tenants-page-client";

export default function PlatformTenantsPage() {
  return (
    <Suspense fallback={<TenantsPageFallback />}>
      <TenantsPageClient />
    </Suspense>
  );
}

function TenantsPageFallback() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading tenants">
      <div className="flex justify-end">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-subtle bg-surface/60" />
    </div>
  );
}