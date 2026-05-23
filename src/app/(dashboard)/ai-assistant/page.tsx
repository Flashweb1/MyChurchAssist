"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, User, Bot, Copy, Check, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PROMPT_SHORTCUTS = [
  { label: "Draft Newsletter", prompt: "Draft a warm, engaging weekly church newsletter for this Sunday. Include a welcome message, scripture of the week, upcoming events, and a closing prayer." },
  { label: "Sermon Outline", prompt: "Create a structured Sunday sermon outline on the topic of 'Faith and Perseverance'. Include an introduction, 3 main points with scripture references, illustrations, and a conclusion with altar call invitation." },
  { label: "Follow-up Script", prompt: "Write a warm and personal phone call script for following up with a first-time visitor to our church. Make it friendly, non-pushy, and Christ-centered." },
  { label: "Birthday Message", prompt: "Write 3 different warm birthday messages we can send to church members on their birthday. Make them feel loved and celebrated." },
  { label: "Announcement", prompt: "Write a short, exciting church announcement for a special Sunday service and community outreach event happening next weekend." },
  { label: "Prayer Request", prompt: "Draft a compassionate email to the church community asking for prayer for a member who is going through a difficult health situation, while maintaining their privacy." },
];

type Message = { role: "user" | "assistant"; content: string };

export default function AIAssistantPage() {
  const { user } = useAuth();
  void user;
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm **Church Assist AI** — your pastoral and administrative assistant.\n\nI can help you:\n• Draft newsletters & announcements\n• Brainstorm sermon outlines\n• Write follow-up scripts\n• Create member communications\n\nSelect a quick action below or type your own request to get started!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage = text.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, messages: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--brand-blue)] to-[var(--brand-purple)] flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
          <p className="text-sm text-[var(--brand-muted)]">Powered by Gemma 4, Nemotron & Trinity (free tier)</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Online</span>
        </div>
      </div>

      {/* Quick Prompt Shortcuts */}
      <div className="shrink-0">
        <p className="text-xs font-semibold text-[var(--brand-muted)] uppercase tracking-widest mb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SHORTCUTS.map((s) => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[var(--brand-border)] rounded-xl text-sm text-slate-700 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] hover:shadow-sm transition-all disabled:opacity-50 focus-ring"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-purple)] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-[var(--brand-blue)] text-white rounded-br-md"
                : "bg-white border border-[var(--brand-border)] text-slate-700 rounded-bl-md shadow-sm"
            }`}>
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none prose-slate"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--brand-border-light)]">
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--brand-muted)] hover:text-[var(--brand-navy)] hover:bg-[var(--brand-bg)] rounded-lg transition-colors"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIdx === idx ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-light)] flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-purple)] flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-[var(--brand-border)] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[var(--brand-blue)] animate-spin" />
                <span className="text-sm text-[var(--brand-muted)]">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 p-2 bg-white border border-[var(--brand-border)] rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/20 focus-within:border-[var(--brand-blue)] transition-all">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(prompt)}
            placeholder="Ask me anything about church management..."
            className="flex-1 px-3 py-2 text-sm outline-none bg-transparent placeholder:text-[var(--brand-muted)]"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(prompt)}
            disabled={!prompt.trim() || loading}
            className="p-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[var(--brand-muted-light)] text-center mt-2">
          AI can make mistakes. Review important content before using.
        </p>
      </div>
    </div>
  );
}
