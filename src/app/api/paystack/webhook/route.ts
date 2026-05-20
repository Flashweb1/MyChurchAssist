import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");

    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, data } = body;

    if (event === "charge.success") {
      const { metadata, reference, amount } = data;
      const { churchId } = metadata;
      const amountInNaira = amount / 100;
      const db = getAdminDb();

      const walletRef = db.collection("wallets").doc(churchId);
      await db.runTransaction(async (tx) => {
        const walletDoc = await tx.get(walletRef);
        const currentBalance = walletDoc.exists ? walletDoc.data()!.balance : 0;
        const totalFunded = walletDoc.exists ? walletDoc.data()!.totalFunded : 0;

        tx.set(walletRef, {
          churchId,
          balance: currentBalance + amountInNaira,
          totalFunded: totalFunded + amountInNaira,
          totalSpent: walletDoc.exists ? walletDoc.data()!.totalSpent : 0,
          updatedAt: new Date(),
        }, { merge: true });
      });

      await db.collection("wallet_transactions").add({
        churchId,
        type: "credit",
        status: "success",
        amount: amountInNaira,
        description: "Wallet top-up via Paystack",
        reference,
        paystackRef: reference,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
