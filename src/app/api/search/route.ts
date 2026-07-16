import { NextResponse } from "next/server";
import { initAdmin, getAuth } from "@/lib/firebase-admin";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  type: z.enum(["all", "members", "departments", "transactions", "newcomers", "followups"]).default("all"),
});

export async function GET(req: Request) {
  try {
    initAdmin();
    const auth = getAuth();

    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const churchId = decodedToken.uid;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "all";

    const validation = searchSchema.safeParse({ query, type });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { query: searchQuery } = validation.data;
    const results = await performSearch(churchId, searchQuery, type);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

async function performSearch(churchId: string, query: string, type: string) {
  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore();
  
  const searchTerm = query.toLowerCase();
  const limit = 10;
  const results: {
    type: string;
    id: string;
    title: string;
    subtitle: string;
    href: string;
    icon: string;
  }[] = [];

  const shouldSearch = (searchType: string) => type === "all" || type === searchType;

  // Search members
  if (shouldSearch("members")) {
    const membersSnap = await db
      .collection("members")
      .where("churchId", "==", churchId)
      .limit(limit)
      .get();

    membersSnap.forEach((doc) => {
      const data = doc.data();
      const fullName = data.fullName?.toLowerCase() || "";
      const email = data.email?.toLowerCase() || "";
      const phone = data.phone || "";

      if (fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm)) {
        results.push({
          type: "member",
          id: doc.id,
          title: data.fullName || "Unknown",
          subtitle: data.email || data.phone || "No contact info",
          href: `/members?id=${doc.id}`,
          icon: "user",
        });
      }
    });
  }

  // Search departments
  if (shouldSearch("departments")) {
    const deptSnap = await db
      .collection("departments")
      .where("churchId", "==", churchId)
      .limit(limit)
      .get();

    deptSnap.forEach((doc) => {
      const data = doc.data();
      const name = data.name?.toLowerCase() || "";

      if (name.includes(searchTerm)) {
        results.push({
          type: "department",
          id: doc.id,
          title: data.name || "Unnamed Department",
          subtitle: data.head ? `Head: ${data.head}` : "No head assigned",
          href: `/departments?id=${doc.id}`,
          icon: "users",
        });
      }
    });
  }

  // Search transactions
  if (shouldSearch("transactions")) {
    const txSnap = await db
      .collection("transactions")
      .where("churchId", "==", churchId)
      .limit(limit)
      .get();

    txSnap.forEach((doc) => {
      const data = doc.data();
      const description = data.description?.toLowerCase() || "";
      const category = data.category?.toLowerCase() || "";

      if (description.includes(searchTerm) || category.includes(searchTerm)) {
        results.push({
          type: "transaction",
          id: doc.id,
          title: data.description || "Untitled",
          subtitle: `${data.type}: ${data.category} - $${data.amount?.toLocaleString() || 0}`,
          href: `/finances?id=${doc.id}`,
          icon: "dollar",
        });
      }
    });
  }

  // Search newcomers
  if (shouldSearch("newcomers")) {
    const newcomerSnap = await db
      .collection("newcomers")
      .where("churchId", "==", churchId)
      .limit(limit)
      .get();

    newcomerSnap.forEach((doc) => {
      const data = doc.data();
      const fullName = data.fullName?.toLowerCase() || "";
      const phone = data.phone || "";

      if (fullName.includes(searchTerm) || phone.includes(searchTerm)) {
        results.push({
          type: "newcomer",
          id: doc.id,
          title: data.fullName || "Unknown",
          subtitle: `Status: ${data.status || "New"}`,
          href: `/newcomers?id=${doc.id}`,
          icon: "user-plus",
        });
      }
    });
  }

  // Search follow-ups
  if (shouldSearch("followups")) {
    const followUpSnap = await db
      .collection("followups")
      .where("churchId", "==", churchId)
      .limit(limit)
      .get();

    followUpSnap.forEach((doc) => {
      const data = doc.data();
      const personName = data.personName?.toLowerCase() || "";

      if (personName.includes(searchTerm)) {
        results.push({
          type: "followup",
          id: doc.id,
          title: data.personName || "Unknown",
          subtitle: `${data.type || "General"} - ${data.status || "Pending"}`,
          href: `/follow-up?id=${doc.id}`,
          icon: "clipboard",
        });
      }
    });
  }

  // Limit results
  return results.slice(0, 20);
}