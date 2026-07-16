import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const setRoleSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  role: z.enum(["super_admin", "admin", "editor", "finance", "viewer"]),
});

export async function POST(request: Request) {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requester = await auth.verifyIdToken(token);

    // Parse and validate body
    const body = await request.json();
    const validation = setRoleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { uid, role } = validation.data;

    // Fetch target user profile
    const targetSnap = await db.collection("users").doc(uid).get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: "Target user profile not found" }, { status: 404 });
    }
    const targetData = targetSnap.data();
    const isSelf = requester.uid === uid;

    if (isSelf) {
      if (targetData?.role !== role) {
        return NextResponse.json({ error: "Unauthorized self role escalation" }, { status: 403 });
      }
    } else {
      const requesterSnap = await db.collection("users").doc(requester.uid).get();
      if (!requesterSnap.exists) {
        return NextResponse.json({ error: "Requester profile not found" }, { status: 403 });
      }
      const requesterData = requesterSnap.data();
      if (requesterData?.role !== "super_admin") {
        return NextResponse.json({ error: "Only Super Admin can change other user roles" }, { status: 403 });
      }
      if (requesterData?.churchId !== targetData?.churchId) {
        return NextResponse.json({ error: "Forbidden: cross-church operation" }, { status: 403 });
      }
    }

    // Apply the claims
    await auth.setCustomUserClaims(uid, { role });
    await db.collection("users").doc(uid).update({ role });

    // Log the audit entry
    await logAudit(
      targetData?.churchId || requester.uid,
      requester.uid,
      requester.email || "unknown",
      "user.role_changed",
      "user",
      uid,
      `Changed role for user ${targetData?.email || uid} from ${targetData?.role} to ${role}`,
      { newValue: { role } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set role error:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}