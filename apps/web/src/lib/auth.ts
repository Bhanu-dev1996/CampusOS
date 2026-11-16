import { apiRequest, setAccessToken } from "@/lib/api-client";
import type { AppRole, UserProfile } from "@/lib/types";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MeResponse {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string | null;
  roles: AppRole[];
  active_role: AppRole;
}

function mapMe(me: MeResponse): UserProfile {
  return {
    id: me.id,
    email: me.email,
    fullName: me.full_name,
    tenantId: me.tenant_id,
    roles: me.roles,
    activeRole: me.active_role,
  };
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
  tenantSubdomain: string;
}): Promise<UserProfile> {
  const tokens = await apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: {
      email: input.email,
      password: input.password,
      tenant_subdomain: input.tenantSubdomain,
    },
  });

  setAccessToken(tokens.access_token);
  const me = await apiRequest<MeResponse>("/auth/me");
  return mapMe(me);
}