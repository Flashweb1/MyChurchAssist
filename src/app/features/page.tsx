import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Users, CalendarCheck, ClipboardList, Building2, BarChart3, UserPlus, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track every member with detailed profiles, departments, and status. Add, edit, and organize your congregation effortlessly.",
  },
  {
    icon: UserPlus,
    title: "Newcomer Tracking",
    description: "Never lose track of first-time visitors. Log visits, track follow-ups automatically, and turn visitors into loyal attendees.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Records",
    description: "Record service attendance by branch, gender, and age group. Visualize trends with powerful charts that are easy to act on.",
  },
  {
    icon: ClipboardList,
    title: "Follow-Up System",
    description: "Assign follow-up tasks for newcomers, prayer requests, and outreach. Keep every conversation moving forward.",
  },
  {
    icon: Building2,
    title: "Department Management",
    description: "Organize church teams, assign leaders, and view department performance from a single unified dashboard.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "View growth, attendance, giving, and engagement data in one place so you can make smarter ministry decisions.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-24">
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-5 py-2 text-sm font-semibold text-[var(--brand-blue)] mb-6">
              <Sparkles className="w-4 h-4" />
              Built for modern ministries
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Every tool your church needs to stay organized, engaged, and growing
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Church Assist brings attendance, giving, member care, communication, and reporting together in one premium platform.
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
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-2xl overflow-hidden">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">How it works</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">A beautifully simple workflow for daily church operations</h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">From new member intake to follow-up, attendance, and finance, every part of your church lifecycle is built to move quickly and feel modern.</p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 1</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Capture attendance instantly</h3>
                    <p className="text-slate-600">Quick check-in screens and mobile-friendly logging make every service painless to track.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 2</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Follow up with confidence</h3>
                    <p className="text-slate-600">Automated follow-up workflows keep every visitor engaged and supported.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 3</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Monitor growth with data</h3>
                    <p className="text-slate-600">Actionable reporting surfaces trends and helps you lead smarter ministry decisions.</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-blue)] font-bold mb-3">Step 4</p>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Manage teams with clarity</h3>
                    <p className="text-slate-600">Keep volunteers, departments, and ministry leaders aligned in one structured system.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[linear-gradient(135deg,_rgba(10,102,255,0.15)_0%,_rgba(34,197,94,0.12)_100%)] p-8">
                <div className="rounded-[1.75rem] bg-white p-8 shadow-xl">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Live ministry snapshot</p>
                      <h3 className="mt-4 text-3xl font-bold text-slate-900">Fast daily visibility</h3>
                    </div>
                    <div className="rounded-3xl bg-[var(--brand-blue)]/10 px-4 py-2 text-sm text-[var(--brand-blue)]">Auto updates</div>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-5 mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span>Attendance</span>
                      <span className="font-semibold text-slate-900">82%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)]" />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-5 mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span>Newcomers</span>
                      <span className="font-semibold text-slate-900">24 active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
                      <span className="rounded-2xl bg-white py-2">Today</span>
                      <span className="rounded-2xl bg-white py-2">This week</span>
                      <span className="rounded-2xl bg-white py-2">Pending</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span>Giving</span>
                      <span className="font-semibold text-slate-900">₦2.4M</span>
                    </div>
                    <div className="rounded-3xl bg-slate-200 p-4 text-sm text-slate-700">
                      +8% compared to last week
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-blue)] mb-4">Start with a beautiful system</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Designed to feel premium for every member of your team</h2>
            <p className="text-lg text-slate-600 leading-relaxed mx-auto max-w-3xl mb-12">A modern interface, thoughtful workflows, and fast access to the ministry data that matters most.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Fast adoption</h3>
                <p className="text-slate-600">A clean interface that leaders and volunteers can use without training.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Built for churches</h3>
                <p className="text-slate-600">Features shaped around real ministry workflows, not generic CRM patterns.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Trusted reliability</h3>
                <p className="text-slate-600">Secure cloud storage and a platform that scales with your congregation.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
