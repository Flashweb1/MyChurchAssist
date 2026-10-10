import { UserProfile } from '@/lib/types';

export function isSuperAdmin(user: UserProfile | null | undefined): boolean {
  return user?.role === 'super_admin';
}

export function canManageCustomers(role?: string): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageSupport(role?: string): boolean {
  return (
    role === 'super_admin' ||
    role === 'admin' ||
    role === 'support_lead' ||
    role === 'support_agent'
  );
}

export function canViewAnalytics(role?: string): boolean {
  return (
    role === 'super_admin' || role === 'admin' || role === 'analyst'
  );
}

export function canImpersonate(role?: string): boolean {
  return role === 'super_admin';
}

export function getSuperAdminPermissions(role?: string) {
  return {
    canManageCustomers: canManageCustomers(role),
    canManageSupport: canManageSupport(role),
    canViewAnalytics: canViewAnalytics(role),
    canImpersonate: canImpersonate(role),
    isSuperAdmin: role === 'super_admin',
  };
}
