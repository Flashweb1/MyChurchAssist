import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: Request) {
  initAdmin();
  const auth = getAuth();

  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requester = await auth.verifyIdToken(token);
    const isSelf = requester.uid === (await request.clone().json()).uid;
    if (!isSelf && requester.role !== "super_admin") {
      return NextResponse.json({ error: "Only Super Admin can change roles" }, { status: 403 });
    }

    const { uid, role } = await request.json();
    const validRoles = ["super_admin", "admin", "editor", "finance", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await auth.setCustomUserClaims(uid, { role });
    await getFirestore().collection("users").doc(uid).update({ role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set role error:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
