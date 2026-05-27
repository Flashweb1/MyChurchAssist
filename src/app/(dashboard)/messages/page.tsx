"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, limit, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Message } from "@/lib/types";
import {
  MessageSquare,
  Plus,
  Send,
  X,
  Loader2,
  Megaphone,
  Calendar,
  Heart,
  Info,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, React.ReactNode> = {
  Announcement: <Megaphone className="w-4 h-4" />,
  Event: <Calendar className="w-4 h-4" />,
  "Prayer Request": <Heart className="w-4 h-4" />,
  General: <Info className="w-4 h-4" />,
};

const typeStyles: Record<string, string> = {
  Announcement: "bg-blue-50 text-blue-700",
  Event: "bg-violet-50 text-violet-700",
  "Prayer Request": "bg-pink-50 text-pink-700",
  General: "bg-slate-100 text-slate-600",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

const emptyForm = {
  title: "",
  content: "",
  type: "Announcement" as Message["type"],
  audience: "Everyone" as Message["audience"],
  targetDepartment: "",
  priority: "Medium" as Message["priority"],
  channels: ["email"] as ("email" | "sms" | "whatsapp")[],
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
};

const CHANNEL_COSTS: Record<string, number> = {
  email: 2,
  sms: 5,
  whatsapp: 10,
};

export default function MessagesPage() {
  const { churchId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchMessages = async () => {
    if (!churchId) return;
    setLoading(true);
    try {
      const q = query(collection(db, "messages"), where("churchId", "==", churchId), orderBy("createdAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message)));
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (churchId) {
      fetchMessages();
    }
  }, [churchId]);

  const handleSend = async (status: "Draft" | "Sent") => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    if (status === "Sent" && form.channels.length === 0) {
      toast.error("Please select at least one delivery channel.");
      return;
    }
    setSaving(true);
    try {
      if (!churchId) return;
      const docRef = await addDoc(collection(db, "messages"), {
        ...form,
        churchId,
        status: status === "Sent" ? "Sending..." : "Draft",
        createdAt: new Date(),
      });

      if (status === "Sent") {
        try {
          const res = await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messageId: docRef.id,
              churchId,
              channels: form.channels,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            await updateDoc(doc(db, "messages", docRef.id), { status: "Draft" });
            throw new Error(data.error || "Failed to deliver messages");
          }
          toast.success(`Messages delivered! Sent: ${data.sent}, Failed: ${data.failed}`);
        } catch (error: any) {
          toast.error(error.message || "Failed to process delivery backend.");
          setShowModal(false);
          setForm(emptyForm);
          fetchMessages();
          return;
        }
      } else {
        toast.success("Draft saved successfully.");
      }

      setShowModal(false);
      setForm(emptyForm);
      fetchMessages();
    } catch {
      toast.error("Failed to save message.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { title: "Total Messages", value: messages.length, icon: MessageSquare, gradient: "from-blue-500 to-blue-600" },
    { title: "Sent", value: messages.filter((m) => m.status === "Sent").length, icon: Send, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Drafts", value: messages.filter((m) => m.status === "Draft").length, icon: FileText, gradient: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6 stagger-children">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Messages</h1>
          <p className="text-[var(--brand-muted)] mt-1 text-sm">Send announcements and communications to your congregation.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl hover:bg-[var(--brand-blue-dark)] transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-ring"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Message</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-[var(--brand-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[var(--brand-muted)] text-xs font-medium">{stat.title}</p>
                <p className="text-xl font-bold text-[var(--brand-navy)]">
                  {loading ? (
                    <span className="skeleton inline-block w-8 h-6 rounded" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[var(--brand-muted)]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-blue)] mb-3" />
            <p className="text-sm">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-12 h-12 mb-4 text-[var(--brand-muted-light)]" />
            <p className="font-semibold text-[var(--brand-navy)]">No messages yet</p>
            <p className="text-sm text-[var(--brand-muted)] mt-1">Click &ldquo;New Message&rdquo; to send your first announcement.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-sm text-[var(--brand-blue)] font-medium hover:underline"
            >
              Create your first message →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--brand-border-light)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-5 hover:bg-[var(--brand-bg)]/80 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${typeStyles[msg.type]}`}
                      >
                        {typeIcons[msg.type]}
                        {msg.type}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${priorityStyles[msg.priority]}`}
                      >
                        {msg.priority}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          msg.status === "Sent"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {msg.status === "Sent" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </>
                        ) : (
                          "Draft"
                        )}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[var(--brand-navy)] truncate">{msg.title}</h3>
                    <p className="text-sm text-[var(--brand-muted)] mt-1 line-clamp-2">{msg.content}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[var(--brand-muted)] font-medium">To: {msg.audience}</p>
                    {msg.targetDepartment && (
                      <p className="text-xs text-[var(--brand-muted)]">{msg.targetDepartment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in">
            <div className="flex items-center justify-between p-6 border-b border-[var(--brand-border)]">
              <h2 className="text-lg font-semibold text-[var(--brand-navy)]">Compose Message</h2>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="p-2 rounded-lg hover:bg-[var(--brand-bg)] text-[var(--brand-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Message title"
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all text-sm"
                />
              </div>

              {/* Type + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Message["type"] })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option>Announcement</option>
                    <option>Event</option>
                    <option>Prayer Request</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Message["priority"] })}
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as Message["audience"] })}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] text-sm bg-white appearance-none cursor-pointer"
                >
                  <option>Everyone</option>
                  <option>Members</option>
                  <option>Workers</option>
                  <option>Newcomers</option>
                  <option>Department</option>
                </select>
              </div>

              {/* Target Department (conditional) */}
              {form.audience === "Department" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Department
                  </label>
                  <input
                    type="text"
                    value={form.targetDepartment}
                    onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
                    placeholder="e.g. Choir, Ushering..."
                    className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] text-sm transition-all"
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Type your message here..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-[var(--brand-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 focus:border-[var(--brand-blue)] transition-all text-sm resize-none"
                />
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Channels</label>
                <div className="flex flex-wrap gap-2">
                  {(["email", "sms", "whatsapp"] as const).map((ch) => {
                    const selected = form.channels.includes(ch);
                    const cost = CHANNEL_COSTS[ch];
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            channels: selected
                              ? form.channels.filter((c) => c !== ch)
                              : [...form.channels, ch],
                          })
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                          selected
                            ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"
                            : "border-[var(--brand-border)] text-[var(--brand-muted)] hover:border-[var(--brand-muted)]"
                        }`}
                      >
                        {CHANNEL_ICONS[ch]}
                        <span className="capitalize">{ch}</span>
                        <span className="text-xs opacity-70">(₦{cost}/ea)</span>
                      </button>
                    );
                  })}
                </div>
                {form.channels.length > 0 && (
                  <p className="text-xs text-[var(--brand-muted)] mt-2">
                    Est. cost per recipient: ₦{form.channels.reduce((s, c) => s + CHANNEL_COSTS[c], 0)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 pb-6 border-t border-[var(--brand-border)] pt-4">
              <button
                onClick={() => handleSend("Draft")}
                disabled={saving}
                className="px-5 py-2.5 border border-[var(--brand-border)] text-slate-700 rounded-xl font-medium hover:bg-[var(--brand-bg)] transition-colors text-sm disabled:opacity-60 focus-ring"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSend("Sent")}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-blue)] text-white rounded-xl font-medium hover:bg-[var(--brand-blue-dark)] transition-all text-sm disabled:opacity-60 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
