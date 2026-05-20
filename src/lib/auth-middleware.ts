import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { ROLE_HIERARCHY, UserRole } from "@/lib/roles";

export async function requireRole(request: Request, minimumRole: UserRole): Promise<boolean> {
  initAdmin();
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAuth().verifyIdToken(header.split("Bearer ")[1]);
    const userRole = (decoded.role || "viewer") as UserRole;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minLevel = ROLE_HIERARCHY[minimumRole];
    return userLevel >= minLevel;
  } catch {
    return false;
  }
}

export async function requireExactRole(request: Request, role: UserRole): Promise<boolean> {
  initAdmin();
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAuth().verifyIdToken(header.split("Bearer ")[1]);
    return (decoded.role || "viewer") === role;
  } catch {
    return false;
  }
}
