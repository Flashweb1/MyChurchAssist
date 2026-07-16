import { NextResponse } from "next/server";
import { initAdmin, getAuth } from "@/lib/firebase-admin";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    initAdmin();
    const auth = getAuth();

    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userRole = decodedToken.role || "viewer";
    
    // Only admins can view audit logs
    if (userRole !== "super_admin" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const churchId = decodedToken.uid;
    const { searchParams } = new URL(req.url);

    const result = await getAuditLogs(churchId, {
      action: searchParams.get("action") as any,
      resourceType: searchParams.get("type") || undefined,
      userId: searchParams.get("userId") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ logs: result.logs });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}