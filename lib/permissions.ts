import type { Role } from "./types"

export type Permission =
  | "viewReports"
  | "manageInventory"
  | "manageSales"
  | "managePurchases"
  | "manageContacts"
  | "manageSettings"

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ["viewReports", "manageInventory", "manageSales", "managePurchases", "manageContacts", "manageSettings"],
  manager: ["viewReports", "manageInventory", "manageSales", "managePurchases", "manageContacts"],
  staff: ["manageInventory", "manageSales"],
}

/** Pure permission check — safe to use on the server and in tests. */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export const ROLES: Role[] = ["admin", "manager", "staff"]
