const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || "";

export async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
      ? TWILIO_WHATSAPP_FROM
      : `whatsapp:${TWILIO_WHATSAPP_FROM}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send WhatsApp" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "WhatsApp service unavailable" };
  }
}
