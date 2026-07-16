import { NextResponse } from "next/server";
import { initAdmin, getAuth } from "@/lib/firebase-admin";
import { aiChatSchema, validateRequest } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are Church Assist AI, a helpful pastoral and administrative assistant designed to help church leaders draft newsletters, brainstorm sermons, and manage their congregations effectively. Be encouraging, professional, and concise. Always ground your responses in Christian values and biblical wisdom where appropriate.`;

interface ModelConfig {
  name: string;
  url: string;
  model: string;
  headers: Record<string, string>;
}

function buildMessages(prompt: string, messages?: { role: string; content: string }[]): { role: string; content: string }[] {
  const out: { role: string; content: string }[] = [{ role: "system", content: SYSTEM_PROMPT }];
  if (messages && Array.isArray(messages)) {
    for (const m of messages) {
      if (m.role === "system") continue;
      out.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content });
    }
  }
  out.push({ role: "user", content: prompt });
  return out;
}

async function tryModel(config: ModelConfig, messages: { role: string; content: string }[]): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...config.headers },
      body: JSON.stringify({ model: config.model, messages, max_tokens: 4096, temperature: 0.7, top_p: 0.95 }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.error?.message || `${config.name} returned ${res.status}` };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return { ok: false, error: `${config.name} returned empty response` };
    return { ok: true, text };
  } catch (err: unknown) {
    return { ok: false, error: `${config.name} failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function POST(req: Request) {
  try {
    initAdmin();
    const auth = getAuth();
    
    // Verify Firebase ID token
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const decodedToken = await auth.verifyIdToken(token);

    // Rate limit: 20 AI requests per user per minute
    const rlKey = getRateLimitKey(req, "ai", decodedToken.uid);
    const rl = rateLimit(rlKey, { limit: 20, windowSec: 60 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rl.retryAfter}s before trying again.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
    
    // Validate request body
    const body = await req.json();
    const validation = validateRequest(aiChatSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { prompt, messages } = validation.data;

    const chatMessages = buildMessages(prompt, messages);
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const openCodeApiKey = process.env.OPENCODE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const headersBase: Record<string, string> = { "X-Title": "Church Assist" };
    if (appUrl) {
      headersBase["HTTP-Referer"] = appUrl;
    }

    const providers: ModelConfig[] = [];

    if (openRouterApiKey) {
      providers.push(
        {
          name: "Gemma 4",
          url: "https://openrouter.ai/api/v1/chat/completions",
          model: "google/gemma-4-26b-a4b-it:free",
          headers: { Authorization: `Bearer ${openRouterApiKey}`, ...headersBase },
        },
        {
          name: "Nemotron",
          url: "https://openrouter.ai/api/v1/chat/completions",
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          headers: { Authorization: `Bearer ${openRouterApiKey}`, ...headersBase },
        },
        {
          name: "Trinity",
          url: "https://openrouter.ai/api/v1/chat/completions",
          model: "arcee-ai/trinity-large-thinking:free",
          headers: { Authorization: `Bearer ${openRouterApiKey}`, ...headersBase },
        }
      );
    }

    if (openCodeApiKey) {
      providers.push({
        name: "Big Pickle",
        url: "https://opencode.ai/zen/v1/chat/completions",
        model: "big-pickle",
        headers: { Authorization: `Bearer ${openCodeApiKey}` },
      });
    }

    if (!providers.length) {
      return NextResponse.json({ error: "AI provider credentials are not configured." }, { status: 503 });
    }

    let lastError: string | undefined;
    for (const provider of providers) {
      const result = await tryModel(provider, chatMessages);
      if (result.ok) return NextResponse.json({ result: result.text });
      lastError = result.error;
    }

    return NextResponse.json({ error: lastError || "All AI services are unavailable. Please try again later." }, { status: 503 });
  } catch (error: unknown) {
    console.error("AI API Error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
