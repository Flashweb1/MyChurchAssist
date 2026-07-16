import { getFirestore } from "firebase-admin/firestore";

export type AuditAction = 
  | "user.login"
  | "user.logout"
  | "user.created"
  | "user.updated"
  | "user.role_changed"
  | "user.disabled"
  | "member.created"
  | "member.updated"
  | "member.deleted"
  | "member.restored"
  | "transaction.created"
  | "transaction.updated"
  | "transaction.deleted"
  | "department.created"
  | "department.updated"
  | "department.deleted"
  | "message.sent"
  | "settings.updated"
  | "wallet.funded"
  | "wallet.debited";

export interface AuditLogEntry {
  id?: string;
  churchId: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  description: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Create an audit log entry in Firestore
 * Should be called after successful sensitive operations
 */
export async function logAudit(
  churchId: string,
  userId: string,
  userEmail: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  description: string,
  options?: {
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const db = getFirestore();
    
    const entry: Omit<AuditLogEntry, "id"> = {
      churchId,
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      description,
      oldValue: options?.oldValue,
      newValue: options?.newValue,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      timestamp: new Date(),
    };

    const docRef = await db.collection("audit_logs").add(entry);
    return { success: true, logId: docRef.id };
  } catch (error) {
    console.error("Audit log failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Audit logging failed" 
    };
  }
}

/**
 * Get audit logs for a church (admin only)
 */
export async function getAuditLogs(
  churchId: string,
  options?: {
    action?: AuditAction;
    resourceType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    startAfter?: string;
  }
) {
  try {
    const db = getFirestore();
    let query: any = db.collection("audit_logs")
      .where("churchId", "==", churchId)
      .orderBy("timestamp", "desc");

    if (options?.action) {
      query = query.where("action", "==", options.action);
    }
    if (options?.resourceType) {
      query = query.where("resourceType", "==", options.resourceType);
    }
    if (options?.userId) {
      query = query.where("userId", "==", options.userId);
    }

    const limit = options?.limit || 50;
    query = query.limit(limit);

    const snapshot = await query.get();
    
    let logs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
    }));

    // Filter by date range in memory (Firestore doesn't support complex date ranges well)
    if (options?.startDate) {
      logs = logs.filter((log: any) => log.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      logs = logs.filter((log: any) => log.timestamp <= options.endDate!);
    }

    return { success: true, logs };
  } catch (error) {
    console.error("Get audit logs failed:", error);
    return {
      success: false,
      logs: [],
      error: error instanceof Error ? error.message : "Failed to fetch audit logs",
    };
  }
}

/**
 * Action descriptions for UI display
 */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  "user.login": "User logged in",
  "user.logout": "User logged out",
  "user.created": "User account created",
  "user.updated": "User profile updated",
  "user.role_changed": "User role changed",
  "user.disabled": "User account disabled",
  "member.created": "Member added",
  "member.updated": "Member updated",
  "member.deleted": "Member archived",
  "member.restored": "Member restored",
  "transaction.created": "Transaction recorded",
  "transaction.updated": "Transaction modified",
  "transaction.deleted": "Transaction deleted",
  "department.created": "Department created",
  "department.updated": "Department updated",
  "department.deleted": "Department archived",
  "message.sent": "Message sent",
  "settings.updated": "Settings updated",
  "wallet.funded": "Wallet funded",
  "wallet.debited": "Wallet debited",
};

/**
 * Resource types for filtering
 */
export const AUDIT_RESOURCE_TYPES = [
  { value: "user", label: "Users" },
  { value: "member", label: "Members" },
  { value: "transaction", label: "Transactions" },
  { value: "department", label: "Departments" },
  { value: "message", label: "Messages" },
  { value: "settings", label: "Settings" },
  { value: "wallet", label: "Wallet" },
] as const;