import { UserRole, UserProfile } from "@/lib/types";

export type { UserRole, UserProfile };

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  finance: 50,
  viewer: 10,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  finance: "Finance",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Full access including user management",
  admin: "Full access to all church data",
  editor: "Can manage members, attendance, and follow-ups",
  finance: "Can manage finances; view-only on other sections",
  viewer: "Read-only access to dashboard and reports",
};

export function hasMinimumRole(userRole: string, minimumRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const minLevel = ROLE_HIERARCHY[minimumRole];
  return userLevel >= minLevel;
}

interface PagePermissions {
  view: UserRole[];
  create?: UserRole[];
  edit?: UserRole[];
  delete?: UserRole[];
}

export const PAGE_PERMISSIONS: Record<string, PagePermissions> = {
  dashboard: { view: ["super_admin", "admin", "editor", "finance", "viewer"] },
  members: { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin", "editor"], delete: ["super_admin", "admin"] },
  attendance: { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin", "editor"], delete: ["super_admin", "admin"] },
  newcomers: { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin", "editor"], delete: ["super_admin", "admin"] },
  "follow-up": { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin", "editor"], delete: ["super_admin", "admin"] },
  departments: { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin", "editor"], delete: ["super_admin", "admin"] },
  messages: { view: ["super_admin", "admin", "editor", "finance"], create: ["super_admin", "admin", "editor"], edit: ["super_admin", "admin"], delete: ["super_admin", "admin"] },
  finances: { view: ["super_admin", "admin", "finance"], create: ["super_admin", "admin", "finance"], edit: ["super_admin", "admin", "finance"], delete: ["super_admin", "admin"] },
  reports: { view: ["super_admin", "admin", "editor", "finance", "viewer"] },
  "ai-assistant": { view: ["super_admin", "admin", "editor"] },
  settings: { view: ["super_admin", "admin"], edit: ["super_admin", "admin"] },
};

export function canView(page: string, role: string): boolean {
  return PAGE_PERMISSIONS[page]?.view?.some((r) => r === role) ?? false;
}

export function canCreate(page: string, role: string): boolean {
  return PAGE_PERMISSIONS[page]?.create?.some((r) => r === role) ?? false;
}

export function canEdit(page: string, role: string): boolean {
  return PAGE_PERMISSIONS[page]?.edit?.some((r) => r === role) ?? false;
}

export function canDelete(page: string, role: string): boolean {
  return PAGE_PERMISSIONS[page]?.delete?.some((r) => r === role) ?? false;
}
