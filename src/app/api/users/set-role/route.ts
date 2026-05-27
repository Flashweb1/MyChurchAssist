import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: Request) {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requester = await auth.verifyIdToken(token);
    
    // Parse body safely
    const body = await request.json();
    const { uid, role } = body;

    const validRoles = ["super_admin", "admin", "editor", "finance", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Fetch target user profile
    const targetSnap = await db.collection("users").doc(uid).get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: "Target user profile not found" }, { status: 404 });
    }
    const targetData = targetSnap.data();

    const isSelf = requester.uid === uid;
    if (isSelf) {
      // For self updates (e.g. during onboarding), the role must match the database profile.
      // Since they cannot update their own role in the database directly after setup (checked via firestore rules),
      // they can only set claims that match their pre-established database role.
      if (targetData?.role !== role) {
        return NextResponse.json({ error: "Unauthorized self role escalation" }, { status: 403 });
      }
    } else {
      // For other users, only super_admin can set roles, and both must belong to the same church.
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set role error:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
