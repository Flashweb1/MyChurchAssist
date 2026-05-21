import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const metrics = [
  { label: "Churches onboarded", value: "1,200+" },
  { label: "Members managed", value: "1M+" },
  { label: "Uptime guaranteed", value: "99.9%" },
];

const quickFeatures = [
  {
    title: "Attendance automation",
    description: "Capture service attendance instantly with mobile-friendly check-in and real-time reports.",
    icon: CalendarCheck,
  },
  {
    title: "Newcomer follow-up",
    description: "Track every first-time visitor and automate the right outreach at the right time.",
    icon: MessageCircle,
  },
  {
    title: "Streamlined giving",
    description: "Keep finance, receipts, and offering records in one secure dashboard.",
    icon: BarChart3,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(10,102,255,0.12),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.12),transparent_26%),var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />

      <main>
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-[0.95fr_0.8fr] items-center">
            <div className="relative z-10 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Church Assist 2.0 – built for modern ministries
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
                The smarter church management platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] via-indigo-500 to-purple-600">growth, care, and connection</span>
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Replace manual ministry workflows with a beautifully designed system built to manage members, attendance, giving, and follow-up without friction.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 fade-in-up" style={{ animationDelay: "0.2s" }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[var(--brand-blue)] px-8 py-4 text-lg font-bold text-white shadow-[0_18px_60px_rgba(10,102,255,0.22)] transition-transform duration-300 hover:-translate-y-1"
                >
                  Start free trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-all duration-300 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                >
                  Explore features
                  <Sparkles className="w-5 h-5" />
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in-up" style={{ animationDelay: "0.3s" }}>
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[var(--brand-blue)]/10 via-transparent to-[var(--brand-green)]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/90 shadow-2xl">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 transition-transform duration-1000 ease-out hover:scale-[1.02]">
                  <Image
                    src="/Dashboard.PNG"
                    alt="Church Assist dashboard screenshot"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_0.95fr] items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Trusted ministry tools</p>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 max-w-3xl">A modern system designed to help churches run with clarity, speed, and care.</h2>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">From attendance and giving to member care and communication, Church Assist centralizes the most important church operations in one premium dashboard.</p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {quickFeatures.map((feature) => (
                    <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--brand-blue)]/15 to-transparent" />
                <div className="relative">
                  <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
                    <div className="mb-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live ministry snapshot</p>
                      <h3 className="mt-4 text-3xl font-bold">Stay ahead of your day</h3>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-3xl bg-slate-900/95 p-5">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-400 mb-4">
                          <span>Attendance</span>
                          <span className="text-slate-200">82% filled</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)]" />
                        </div>
                      </div>
                      <div className="rounded-3xl bg-slate-900/95 p-5">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-400 mb-4">
                          <span>Newcomers</span>
                          <span className="text-slate-200">24 active</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                          <span className="rounded-2xl bg-slate-800/80 py-2">Today</span>
                          <span className="rounded-2xl bg-slate-800/80 py-2">This week</span>
                          <span className="rounded-2xl bg-slate-800/80 py-2">Pending</span>
                        </div>
                      </div>
                      <div className="rounded-3xl bg-slate-900/95 p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Giving</p>
                          <p className="mt-2 text-xl font-semibold text-white">₦2.4M</p>
                        </div>
                        <div className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-slate-200">+8%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-5 py-2 text-sm font-semibold text-[var(--brand-blue)] mb-6">
              <ShieldCheck className="w-4 h-4" />
              Built for ministry privacy and reliability
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">A premium experience for every team member</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">Church Assist is designed to feel fast, intuitive, and trustworthy for pastors, administrators, volunteers, and finance teams alike.</p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Empower your team</h3>
                <p className="text-slate-500">Give every ministry leader a clear view of attendance, follow-up, and member health.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-green)]/10 text-[var(--brand-green)]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Feel instantly modern</h3>
                <p className="text-slate-500">A sleek, fast interface that modern church teams actually enjoy using every day.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure by design</h3>
                <p className="text-slate-500">Secure cloud storage, role controls, and admin oversight keep your church data safe.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-28">
          <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] p-10 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-200/80 mb-4">Ready to modernize your ministry?</p>
                <h2 className="text-4xl font-bold leading-tight">Start organizing church operations with a fresh, modern platform.</h2>
                <p className="mt-6 text-lg text-slate-200/90 max-w-2xl">No setup stress, no hidden fees, and no unnecessary complexity. Just one beautifully designed system for your whole church.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-3xl bg-white px-8 py-4 text-lg font-bold text-[var(--brand-blue)] shadow-[0_18px_45px_rgba(255,255,255,0.24)]">
                  Start free trial
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center rounded-3xl border border-white/60 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all">
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
