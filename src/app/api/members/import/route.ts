import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface MemberInput {
  fullName: string;
  phone: string;
  email: string;
  branch: string;
  department: string;
  status: "Active" | "Inactive";
  dateOfBirth?: string;
  preferredChannel?: "email" | "sms" | "whatsapp";
  joinedAt?: string;
  tags?: string[];
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

function validateMember(m: MemberInput, row: number): string | null {
  if (!m.fullName || m.fullName.trim().length < 2)
    return `Row ${row}: Full name is required (min 2 characters)`;
  if (m.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))
    return `Row ${row}: Invalid email "${m.email}"`;
  if (m.phone && !/^[+\d\s\-()]{7,15}$/.test(m.phone))
    return `Row ${row}: Invalid phone number "${m.phone}"`;
  if (m.status && !["Active", "Inactive"].includes(m.status))
    return `Row ${row}: Status must be "Active" or "Inactive" (got "${m.status}")`;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { churchId, members } = body as { churchId: string; members: MemberInput[] };

    if (!churchId)
      return NextResponse.json({ error: "Missing churchId" }, { status: 400 });
    if (!members || !Array.isArray(members) || members.length === 0)
      return NextResponse.json({ error: "No members provided" }, { status: 400 });

    const db = getAdminDb();
    const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
    const validMembers: { data: Record<string, unknown>; row: number }[] = [];

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const row = i + 2;
      const validationError = validateMember(m, row);
      if (validationError) {
        result.errors.push({ row, reason: validationError });
        continue;
      }

      validMembers.push({
        data: {
          churchId,
          fullName: m.fullName.trim(),
          phone: m.phone?.trim() || "",
          email: m.email?.trim() || "",
          branch: m.branch?.trim() || "Main Campus",
          department: m.department?.trim() || "None",
          status: m.status || "Active",
          dateOfBirth: m.dateOfBirth || "",
          preferredChannel: m.preferredChannel || "",
          joinedAt: m.joinedAt || new Date().toISOString().split("T")[0],
          tags: m.tags || [],
          createdAt: FieldValue.serverTimestamp(),
        },
        row,
      });
    }

    const CHUNK_SIZE = 500;
    const membersRef = db.collection("members");

    for (let i = 0; i < validMembers.length; i += CHUNK_SIZE) {
      const chunk = validMembers.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      for (const { data } of chunk) {
        batch.set(membersRef.doc(), data);
      }
      await batch.commit();
    }

    result.imported = validMembers.length;
    result.skipped = result.errors.length;

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
  }
}
