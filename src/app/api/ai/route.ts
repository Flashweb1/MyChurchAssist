import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Church Assist AI, a helpful pastoral and administrative assistant designed to help church leaders draft newsletters, brainstorm sermons, and manage their congregations effectively. Be encouraging, professional, and concise. Always ground your responses in Christian values and biblical wisdom where appropriate.`;

interface ModelConfig {
  name: string;
  url: string;
  model: string;
  headers: Record<string, string>;
}

function buildMessages(prompt: string, messages?: { role: string; content: string }[]): { role: string; content: string }[] {
  const out: { role: string; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  if (messages && Array.isArray(messages)) {
    for (const m of messages) {
      if (m.role === "system") continue;
      out.push({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      });
    }
  }
  out.push({ role: "user", content: prompt });
  return out;
}

async function tryModel(config: ModelConfig, messages: { role: string; content: string }[]): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.95,
      }),
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
    const { prompt, messages } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const chatMessages = buildMessages(prompt, messages);

    // Tier 1: OpenRouter — Google Gemma 4 26B (free, best for writing)
    const gemmaResult = await tryModel({
      name: "Gemma 4",
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "google/gemma-4-26b-a4b-it:free",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Church Assist",
      },
    }, chatMessages);
    if (gemmaResult.ok) return NextResponse.json({ result: gemmaResult.text });

    // Tier 2: OpenRouter — NVIDIA Nemotron 120B (free)
    const nemotronResult = await tryModel({
      name: "Nemotron",
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Church Assist",
      },
    }, chatMessages);
    if (nemotronResult.ok) return NextResponse.json({ result: nemotronResult.text });

    // Tier 3: OpenRouter — Arcee Trinity (free)
    const trinityResult = await tryModel({
      name: "Trinity",
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "arcee-ai/trinity-large-thinking:free",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Church Assist",
      },
    }, chatMessages);
    if (trinityResult.ok) return NextResponse.json({ result: trinityResult.text });

    // Tier 4: OpenCode Zen — big-pickle (free, different provider)
    const zenResult = await tryModel({
      name: "Big Pickle",
      url: "https://opencode.ai/zen/v1/chat/completions",
      model: "big-pickle",
      headers: {
        Authorization: `Bearer ${process.env.OPENCODE_API_KEY}`,
      },
    }, chatMessages);
    if (zenResult.ok) return NextResponse.json({ result: zenResult.text });

    // All tiers failed
    return NextResponse.json(
      { error: zenResult.error || "All AI services are unavailable. Please try again later." },
      { status: 503 }
    );
  } catch (error: unknown) {
    console.error("AI API Error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
