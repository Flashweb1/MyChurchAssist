import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { CheckCircle2, ShieldCheck, Zap, Heart } from "lucide-react";

const benefits = [
  "No more scattered spreadsheets or lost paper records.",
  "Real-time synchronization across every device and ministry team.",
  "A modern interface that requires zero training for volunteers.",
  "Works beautifully on mobile, tablet, and desktop.",
  "Bank-level secure cloud storage built for church data.",
  "Built specifically for the unique needs of churches and ministries.",
];

const pillars = [
  {
    title: "Care-driven workflows",
    description: "Create follow-up journeys that help newcomers feel welcomed and cared for.",
    icon: Heart,
  },
  {
    title: "Reliable leadership tools",
    description: "Give pastors and administrators instant visibility into attendance, giving, and engagement.",
    icon: ShieldCheck,
  },
  {
    title: "Fast, secure operations",
    description: "Cloud-based management that keeps your most important church data safe and accessible.",
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
              <Heart className="w-4 h-4" />
              Why churches choose Church Assist
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Designed to empower ministry teams with clarity and care
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Church Assist replaces cluttered tools with a single premium platform built for the pace and heart of modern churches.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[0.95fr_0.95fr] items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">The smarter way to run church operations</h2>
              <div className="space-y-5">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">{benefit}</p>
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
                      <h3 className="mt-3 text-2xl font-semibold">Trust your church data is protected</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Encrypted storage, permissions, and cloud backups.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Automatic audit trails for attendance, giving, and follow-up history.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-5">
                      <p className="text-sm text-slate-400">Team roles that keep admin access secure and simple.</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-3xl bg-white/10 p-5 text-sm text-slate-300 border border-white/10">
                    <p className="font-semibold text-white">99.9% uptime</p>
                    <p className="mt-2 text-slate-400">Your church data stays available when you need it most.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center mb-14">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-blue)] mb-4">Built for ministry leaders</p>
            <h2 className="text-4xl font-bold text-slate-900">Every feature supports a healthier, more connected church</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-[var(--brand-blue)]">
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{pillar.title}</h3>
                <p className="text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
