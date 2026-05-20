import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, amount, churchId } = await req.json();
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !email || !amount || !churchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack uses kobo
        currency: "NGN",
        metadata: { churchId },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/wallet?success=true`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 400 });
    }

    return NextResponse.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
