import { apiRequest } from "@/lib/api-client";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  academic_year: string;
  timezone: string;
  created_at: string;
  updated_at?: string;
  principal_email?: string | null;
  principal_name?: string | null;
  user_count?: number;
}

export interface PrincipalOnboarding {
  principal_email: string;
  temporary_password: string;
  login_subdomain: string;
  message: string;
}

export interface TenantCreated extends Tenant {
  principal_onboarding: PrincipalOnboarding;
}

export interface TenantCreateInput {
  name: string;
  subdomain: string;
  academic_year: string;
  principal_email: string;
  timezone?: string;
}

export interface TenantPublic {
  id: string;
  name: string;
  subdomain: string;
}

export function listTenants() {
  return apiRequest<Tenant[]>("/platform/tenants");
}

export function createTenant(body: TenantCreateInput) {
  return apiRequest<TenantCreated>("/platform/tenants", {
    method: "POST",
    body: {
      timezone: "Asia/Kolkata",
      ...body,
      subdomain: body.subdomain.toLowerCase().trim(),
    },
  });
}

export function resolveTenantBySubdomain(subdomain: string) {
  const key = subdomain.toLowerCase().trim();
  return apiRequest<TenantPublic>(`/tenants/by-subdomain/${encodeURIComponent(key)}`, {
    skipAuth: true,
  });
}