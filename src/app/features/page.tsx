import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Users, CalendarCheck, ClipboardList, Building2, BarChart3, UserPlus, ArrowRight, ShieldCheck, Sparkles, Brain, Bot, Send } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "AI Member Analytics",
    description: "Track member profiles and let AI analyze engagement levels, automatically flagging members who might need prayer or care contact.",
  },
  {
    icon: Sparkles,
    title: "AI Newcomer Outreach",
    description: "Personalized welcome texts and emails are auto-drafted by AI using information provided during check-in, ready to approve.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Attendance scan",
    description: "Log attendance in seconds via QR code scans, mobile-friendly headcounts, or sheet scans. Let AI project attendance trends.",
  },
  {
    icon: ClipboardList,
    title: "Automated Follow-up Workflows",
    description: "Set trigger actions (e.g., newcomer checks in or member absent 3 weeks) and auto-assign task checklists to specific leaders.",
  },
  {
    icon: Building2,
    title: "Department Coordination",
    description: "Organize ministries, departments, and volunteer teams. Let the platform automate schedule notifications and reminder tasks.",
  },
  {
    icon: BarChart3,
    title: "Intelligent Finance Insights",
    description: "Track offerings, tithes, and receipts in one dashboard. AI forecasts giving patterns and automatically compiles reports.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-24">
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#DFF7F4] border border-[#0DBA8B]/30 px-4.5 py-1.5 rounded-full text-[11px] font-bold shadow-sm hover:shadow-md transition-all cursor-default mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0DBA8B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0DBA8B]"></span>
              </span>
              <span className="text-[#082B6F] tracking-wide uppercase">AI-Powered Ministry Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Every automation tool your church needs to grow and care
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Church Assist replaces manual workloads with a single, intelligent system built for attendance tracking, member follow-ups, giving, and communication.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-2xl overflow-hidden">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">How it works</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Autonomous systems working behind the scenes</h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">From new member intake to follow-up, attendance tracking, and reporting, Church Assist coordinates tasks automatically.</p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 1</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Quick QR & headcount scans</h3>
                    <p className="text-slate-600 text-sm">Scan QR codes or enter headcounts. AI updates dashboards and logs newcomer info instantly.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 2</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Automated AI follow-ups</h3>
                    <p className="text-slate-600 text-sm">AI automatically drafts personalized follow-up emails and WhatsApp messages for your care team to approve.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 3</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Intelligent care alerts</h3>
                    <p className="text-slate-600 text-sm">Tracks attendance and flags when a member misses consecutive services, notifying the pastor to check in.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 4</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Hands-off reporting</h3>
                    <p className="text-slate-600 text-sm">Offering trends, attendance rates, and team spreadsheets compile automatically in the background.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[linear-gradient(135deg,_rgba(10,102,255,0.15)_0%,_rgba(34,197,94,0.12)_100%)] p-8">
                <div className="rounded-[1.75rem] bg-white p-8 shadow-xl">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">Live ministry snapshot</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">Church Assist AI active</h3>
                    </div>
                    <div className="rounded-3xl bg-[var(--brand-blue)]/15 border border-[var(--brand-blue)]/20 px-3 py-1 text-xs text-[var(--brand-blue)] font-bold">Auto pilot</div>
                  </div>
                  
                  {/* Attendance insight */}
                  <div className="rounded-2xl bg-slate-50 p-4 mb-4 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold">Attendance projection</span>
                      <span className="font-bold text-slate-900">82%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mb-2">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)]" />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI projection: Stable growth
                    </p>
                  </div>

                  {/* Newcomers auto messages */}
                  <div className="rounded-2xl bg-slate-50 p-4 mb-4 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold">Newcomer follow-ups</span>
                      <span className="font-bold text-slate-900">24 active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-slate-500 mb-2">
                      <span className="rounded-xl bg-white border border-slate-200 py-1.5 font-medium">18 Sent automatically</span>
                      <span className="rounded-xl bg-indigo-50 border border-indigo-100 py-1.5 text-[var(--brand-blue)] font-semibold">6 Awaiting review</span>
                    </div>
                  </div>

                  {/* Financial projections */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold">Weekly offering</span>
                      <span className="font-bold text-slate-900">₦2.4M</span>
                    </div>
                    <div className="text-[10px] text-slate-600 leading-relaxed">
                      AI Projected giving: <span className="text-emerald-600 font-bold">+12% trend next Sunday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-blue)] mb-4">Start with an intelligent system</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Designed to feel premium for every member of your team</h2>
            <p className="text-lg text-slate-600 leading-relaxed mx-auto max-w-3xl mb-12">An elegant interface, automated workflows, and fast access to the ministry data that matters most.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero training needed</h3>
                <p className="text-slate-600 text-sm">Volunteers and leaders can use the automated check-ins and lists instantly without overhead.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">AI assistant integration</h3>
                <p className="text-slate-600 text-sm">Automations shape around real ministry lifecycle workflows, not generic sales CRM patterns.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Enterprise reliability</h3>
                <p className="text-slate-600 text-sm">Encrypted server databases keep your congregation, attendance, and giving logs secure.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
