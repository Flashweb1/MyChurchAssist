import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  churchName: z.string().max(100).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 3 contact form submissions per IP per 10 minutes
    const rl = rateLimit(getRateLimitKey(req, "contact"), { limit: 3, windowSec: 600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfter}s before trying again.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { firstName, lastName, email, churchName, message } = validation.data;

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
