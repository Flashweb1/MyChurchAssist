import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, churchName, message } = await req.json();
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing, falling back to console log");
      console.log("Contact form submission:", { firstName, lastName, email, churchName, message });
      return NextResponse.json({ success: true });
    }

    const { error } = await resend.emails.send({
      from: "Church Assist <onboarding@resend.dev>",
      to: "hello@churchassist.app", // Send to admin email
      subject: `New Contact from ${firstName} ${lastName} (${churchName || "No Church Specified"})`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Church Name:</strong> ${churchName || "N/A"}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send message via email provider" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
