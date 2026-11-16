export type AppRole =
  | "SUPER_ADMIN"
  | "PRINCIPAL"
  | "FACULTY"
  | "STUDENT"
  | "PARENT"
  | "FINANCE_ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  roles: AppRole[];
  activeRole: AppRole;
}