const TERMII_API_KEY = process.env.TERMII_API_KEY || "";

export async function sendSms({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!TERMII_API_KEY) {
    return { success: false, error: "Termii API key not configured" };
  }

  try {
    const response = await fetch("https://api.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to,
        from: "ChurchAssist",
        sms: message,
        type: "plain",
        channel: "generic",
      }),
    });

    const data = await response.json();
    if (!response.ok || data.message !== "Successfully Send") {
      return { success: false, error: data.message || "Failed to send SMS" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "SMS service unavailable" };
  }
}
