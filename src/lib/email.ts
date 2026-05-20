const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function sendEmail({
  to,
  subject,
  html,
  from = "Church Assist <noreply@church-assist.com>",
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Email service unavailable" };
  }
}
