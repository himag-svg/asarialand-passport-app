import type { Role } from "@/types";

export interface RoleInfo {
  role: Role;
  label: string;
  description: string;
  defaultRedirect: string;
}

export const ROLES: RoleInfo[] = [
  {
    role: "client",
    label: "Client",
    description: "View status, upload documents, and track your application",
    defaultRedirect: "/dashboard",
  },
  {
    role: "processing_team",
    label: "Processing Team",
    description: "Manage the passport renewal pipeline",
    defaultRedirect: "/admin/dashboard",
  },
  {
    role: "finance",
    label: "Finance",
    description: "Handle payments, invoicing, and financial coordination",
    defaultRedirect: "/admin/dashboard",
  },
  {
    role: "local_agent",
    label: "Local Agent",
    description: "Government submission and passport collection",
    defaultRedirect: "/admin/dashboard",
  },
  {
    role: "admin",
    label: "Administrator",
    description: "Full system access",
    defaultRedirect: "/admin/dashboard",
  },
];

export const STAFF_ROLES: Role[] = ["processing_team", "finance", "local_agent", "admin"];

export function isStaffRole(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function getRoleInfo(role: Role): RoleInfo | undefined {
  return ROLES.find((r) => r.role === role);
}
