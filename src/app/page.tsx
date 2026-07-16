"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck, MessageCircle, ShieldCheck, Sparkles, Users, Send, CheckCircle, TrendingUp, Bot, Brain } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { useDarkMode } from "@/lib/dark-mode-context";

const metrics = [
  { label: "Hours saved / week", value: "10h+" },
  { label: "Churches onboarded", value: "1,200+" },
  { label: "Outreach Response", value: "94%" },
];

const quickFeatures = [
  {
    title: "AI Attendance Analysis",
    description: "Capture attendance via smart check-ins, and let AI analyze trends, flag absentees, and predict growth.",
    icon: CalendarCheck,
  },
  {
    title: "Automated Follow-up",
    description: "Instantly draft and dispatch personalized welcome sequences for newcomers on autopilot.",
    icon: MessageCircle,
  },
  {
    title: "Smart Giving Insights",
    description: "Track offering levels, auto-reconcile finance streams, and view AI-predicted donation trends.",
    icon: BarChart3,
  },
];

export default function LandingPage() {
  const { darkMode } = useDarkMode();
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-[var(--brand-bg)]'} selection:bg-[var(--brand-blue)]/20 overflow-x-hidden`}>
      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Clean subtle grid pattern only — no blobs */}
          <div className="absolute inset-0 pattern-dots opacity-[0.15] pointer-events-none" />
          {/* Single very soft top-centre light — like a studio light, not aurora */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/8 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 grid gap-16 lg:grid-cols-[1.15fr_0.85fr] items-center pt-8">
            
            {/* Left Column: Interactive Value Proposition */}
            <div className="flex flex-col items-start text-left space-y-6 max-w-2xl">
              
              <div className="fade-in-up" style={{ animationDelay: "0.05s" }}>
                <div className="inline-flex items-center gap-2 bg-[#DFF7F4] border border-[#0DBA8B]/30 px-4.5 py-1.5 rounded-full text-[11px] font-bold shadow-sm hover:shadow-md transition-all cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DBA8B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0DBA8B]"></span>
                  </span>
                  <span className="text-[#082B6F] tracking-wide uppercase">AI-Powered Ministry Management Platform</span>
                </div>
              </div>

              <h1 className="fade-in-up text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-2xl" style={{ animationDelay: "0.1s" }}>
                Modern, AI-powered system for <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] to-[#0DBA8B] animate-text-gradient bg-[length:200%_auto]">
                  growth & care
                </span>
              </h1>

              <p className="fade-in-up text-lg text-slate-600 leading-relaxed max-w-xl" style={{ animationDelay: "0.15s" }}>
                Replace manual spreadsheets and tedious operations. Let AI track newcomer integrations, automate messaging, forecast giving trends, and run check-ins seamlessly.
              </p>

              {/* Action Buttons */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4 pt-2 fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Link
                  href="/login?demo=true"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-blue-dark)] px-8 py-4 text-base font-bold text-white shadow-[0_8px_25px_rgba(10,102,255,0.25)] hover:shadow-[0_12px_35px_rgba(10,102,255,0.35)] hover:-translate-y-0.5 transition-all duration-300 btn-ripple"
                >
                  Try demo free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md px-8 py-4 text-base font-semibold text-slate-700 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] hover:bg-white transition-all duration-300"
                >
                  Explore features
                </Link>
              </div>

              {/* Avatar Social Proof */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-slate-200/60 w-full fade-in-up" style={{ animationDelay: "0.25s" }}>
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  ].map((src, i) => (
                    <div key={i} className="relative h-9 w-9 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm">
                      <Image 
                        src={src} 
                        alt={`Church Leader User ${i + 1}`} 
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Join 1,200+ ministries
                  </div>
                  <div className="text-slate-500">actively automating workloads with Church Assist</div>
                </div>
              </div>

            </div>

            {/* Right Column: Layered 3D Floating Collage */}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center fade-in-up mt-8 lg:mt-0" style={{ animationDelay: "0.3s" }}>

              {/* Main Dashboard Preview Card */}
              <div className="w-[90%] md:w-[85%] aspect-[16/10] rounded-2xl border border-white/60 bg-white/30 p-2 sm:p-3 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] animate-float-slow">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-900/80 border-b border-slate-800 flex items-center px-3 gap-1.5 z-20">
                    <span className="w-2 h-2 rounded-full bg-red-500/70" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <span className="w-2 h-2 rounded-full bg-green-500/70" />
                    <span className="text-[9px] text-slate-500 font-mono ml-4">churchassist.io/dashboard</span>
                  </div>
                  <div className="relative w-full h-full pt-6">
                    <Image
                      src="/Dashboard.PNG"
                      alt="Church Assist AI Dashboard"
                      fill
                      className="object-cover object-top opacity-90"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Floating Widget 1: ✨ Church Assist AI Suggestions (Floats Top Right) */}
              <div className="absolute -top-6 -right-2 md:right-2 w-64 bg-slate-950/95 text-white p-4 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl animate-float-medium animate-pulse-glow-ai z-30">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="h-5 w-5 rounded-lg bg-[var(--brand-blue)]/20 text-[var(--brand-blue-light)] flex items-center justify-center border border-[var(--brand-blue)]/30">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0DBA8B]">✨ Church Assist AI</span>
                  <span className="ml-auto text-[9px] bg-[var(--brand-blue)]/20 text-[var(--brand-blue-light)] px-1.5 py-0.5 rounded-full font-medium">Ready</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  I detected 3 newcomers from Sunday service who haven't been contacted. Draft welcome SMS?
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    className="flex-1 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-light)] text-white font-semibold text-[10px] py-1.5 px-3 rounded-lg transition-all shadow-md shadow-[var(--brand-blue)]/20 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-2.5 h-2.5" /> Approve & Send
                  </button>
                  <button 
                    type="button"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 py-1.5 px-2 rounded-lg text-[10px] transition-all border border-slate-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Floating Widget 2: Automated Outreach pipeline (Floats Bottom Left) */}
              <div className="absolute -bottom-6 -left-4 md:-left-2 w-72 bg-white/95 border border-slate-200/80 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-slow z-30">
                <div className="flex items-center justify-between gap-4 mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800">Auto-Workflow Triggered</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">0.02s latency</span>
                </div>
                <div className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[9px]">1</div>
                    <div>
                      <div className="font-semibold">QR Check-in scanned</div>
                      <div className="text-[9px] text-slate-400">Visitor: Sarah Jenkins</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[9px]"><CheckCircle className="w-2.5 h-2.5" /></div>
                    <div>
                      <div className="font-semibold text-slate-800">AI Outreach Drafted</div>
                      <div className="text-[9px] text-emerald-600 font-medium">WhatsApp sent automatically</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Widget 3: Giving Projections (Floats Bottom Right) */}
              <div className="absolute bottom-10 -right-8 w-44 bg-white/95 border border-slate-200/80 p-3.5 rounded-2xl shadow-xl backdrop-blur-xl animate-float-fast z-20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">AI Offering Forecast</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-base font-bold text-slate-900">₦2.4M</div>
                <div className="text-[9px] text-emerald-600 font-semibold mb-2">+12% trend projected</div>
                
                {/* SVG Graph path drawing micro-animation */}
                <div className="w-full h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    <path
                      d="M 5,35 Q 25,28 45,32 T 85,10"
                      fill="none"
                      stroke="url(#gradient-emerald)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-draw-path"
                    />
                    <defs>
                      <linearGradient id="gradient-emerald" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Metrics Strip */}
        <section className="bg-slate-50 border-y border-slate-200/70 py-10 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col items-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{metric.value}</p>
                <p className="mt-1.5 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest text-center">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-bold">Trusted Ministry Tools</p>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                  A modern system designed to help churches automate workflows and care for members.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  From automated follow-ups and smart giving records to instant checks and AI assistance, Church Assist centralizes your most important operations in one premium system.
                </p>

                <div className="grid gap-4 sm:grid-cols-3 pt-4">
                  {quickFeatures.map((feature) => (
                    <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snapshot Dashboard Mockup */}
              <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 p-8 shadow-xl overflow-hidden">
                <div className="relative">
                  <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Live Ministry snapshot</p>
                        <h3 className="mt-2 text-2xl font-bold">AI Workflow Dashboard</h3>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Active</span>
                    </div>
                    
                    <div className="grid gap-4">
                      {/* Attendance Insight card */}
                      <div className="rounded-2xl bg-slate-900/95 p-5 border border-slate-800">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-3">
                          <span>Attendance Monitoring</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                            <Sparkles className="w-3 h-3" /> AI Scanned
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                          <span>82% filled today</span>
                          <span className="text-[10px] text-slate-500">Trend: Stable</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] animate-pulse" />
                        </div>
                      </div>

                      {/* Newcomer Auto-outreach status */}
                      <div className="rounded-2xl bg-slate-900/95 p-5 border border-slate-800">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-3">
                          <span>Newcomer Follow-up Status</span>
                          <span className="text-[var(--brand-blue-light)] text-[10px] font-semibold bg-[var(--brand-blue)]/15 px-2 py-0.5 rounded-full border border-[var(--brand-blue)]/20">Auto Pilot</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs text-slate-400 text-center">
                          <div className="rounded-xl bg-slate-800/80 p-2">
                            <div className="text-white font-bold text-sm">18</div>
                            <div className="text-[9px] text-slate-500">Auto SMS</div>
                          </div>
                          <div className="rounded-xl bg-slate-800/80 p-2">
                            <div className="text-white font-bold text-sm">6</div>
                            <div className="text-[9px] text-slate-500">Pending Review</div>
                          </div>
                          <div className="rounded-xl bg-indigo-950/40 border border-indigo-900/30 p-2 text-indigo-300">
                            <div className="font-bold text-sm">94%</div>
                            <div className="text-[9px] text-indigo-400">Response</div>
                          </div>
                        </div>
                      </div>

                      {/* AI giving trends */}
                      <div className="rounded-2xl bg-slate-900/95 p-5 border border-slate-800 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Weekly Giving</p>
                          <p className="mt-1 text-lg font-bold text-white">₦2.4M</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] text-emerald-400 font-semibold">+8% this week</span>
                          <p className="mt-1 text-[9px] text-slate-500">AI Forecast: Positive Growth</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Operations Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-5 py-2 text-sm font-semibold text-[var(--brand-blue)] mb-6">
              <ShieldCheck className="w-4 h-4" />
              Automated operations you can trust
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Reclaim hours of admin work every week</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Church Assist coordinates your church administration behind the scenes so your ministry team can focus on what matters most: caring for people.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Outreach Drafts</h3>
                <p className="text-slate-500 text-sm">
                  Let AI construct highly-personalized welcome and prayer team responses based on check-in answers.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Workload Automation</h3>
                <p className="text-slate-500 text-sm">
                  Triggers follow-ups, assigns pastors, generates offering receipts, and compiles attendance sheets automatically.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Predictive Insights</h3>
                <p className="text-slate-500 text-sm">
                  Predict weekly attendance patterns and seasonal giving fluctuations to coordinate your plans proactively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 sm:px-6 lg:px-8 pb-28">
          <div className="max-w-6xl mx-auto rounded-[2.5rem] bg-slate-900 border border-slate-800 p-10 text-white shadow-xl">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">Ready to automate your ministry?</p>
                <h2 className="text-4xl font-bold leading-tight text-white">Start organizing operations with a fresh, AI-powered platform.</h2>
                <p className="mt-6 text-lg text-slate-400 max-w-2xl">No setup complexity, no manual overhead. Just one beautifully designed, intelligent system for your whole church.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 hover:bg-indigo-500 px-8 py-4 text-lg font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5">
                  Start free trial
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center rounded-3xl border border-slate-700 px-8 py-4 text-lg font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                  View plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
