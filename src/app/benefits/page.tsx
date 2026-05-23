import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { CheckCircle2, ShieldCheck, Zap, Heart, Sparkles } from "lucide-react";

const benefits = [
  "AI coordinates your administrative tasks so pastors can focus on ministry, not spreadsheets.",
  "Automated follow-ups ensure that no newcomer or absent member falls through the cracks.",
  "Real-time synchronization across check-in scanners, mobile web apps, and lead dashboards.",
  "A modern, simple interface that requires zero training for volunteers or leaders.",
  "Smart dashboards predict weekly giving projections and spot seasonal attendance patterns.",
  "Bank-level secure cloud storage protects your congregation's private information.",
];

const pillars = [
  {
    title: "AI-driven newcomer care",
    description: "Let AI draft personalized welcome emails and SMS prompts to keep newcomers engaged and supported.",
    icon: Heart,
  },
  {
    title: "Intelligent analytics",
    description: "Give pastors instant projections for church attendance and weekly giving trends at a glance.",
    icon: ShieldCheck,
  },
  {
    title: "Hands-off automations",
    description: "Background workers trigger outreach, auto-generate offering receipts, and compile stats autonomously.",
    icon: Zap,
  },
];

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-24">
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              Why churches choose Church Assist
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Designed to automate ministry workloads with clarity and care
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Church Assist replaces manual administrative overhead with a single, intelligent system built for the pace and heart of modern churches.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[0.95fr_0.95fr] items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">The automated way to run church operations</h2>
              <div className="space-y-5">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-slate-700 text-base sm:text-lg leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-100 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[var(--brand-blue)]/10 blur-3xl" />
              <div className="relative">
                <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Security built in</p>
                      <h3 className="mt-3 text-2xl font-semibold">Protected & secure records</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Encrypted database storage, user permissions, and automatic cloud backups.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Automatic audit trails for attendance records, giving registries, and outreach logs.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Ministry roles that keep admin access secure, restricted, and simple.</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-3xl bg-white/10 p-5 text-sm text-slate-300 border border-white/10">
                    <p className="font-semibold text-white">99.9% uptime guaranteed</p>
                    <p className="mt-2 text-slate-450">Your church data stays available and active when you need it most.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center mb-14">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-blue)] mb-4 font-bold">Built for ministry leaders</p>
            <h2 className="text-4xl font-bold text-slate-900">Every feature supports a healthier, more automated church</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-[var(--brand-blue)]">
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{pillar.title}</h3>
                <p className="text-slate-655 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
