import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Users, CalendarCheck, ClipboardList, Building2, BarChart3, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track every member with detailed profiles, departments, and status. Add, edit, and organize your congregation effortlessly. Say goodbye to scattered spreadsheets.",
  },
  {
    icon: UserPlus,
    title: "Newcomer Tracking",
    description: "Never lose track of first-time visitors. Log visits, track follow-ups automatically, and convert newcomers into active, engaged members.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Records",
    description: "Record service attendance by branch, gender, and age group. Visualize trends with beautiful charts and identify patterns in congregation growth.",
  },
  {
    icon: ClipboardList,
    title: "Follow-Up System",
    description: "Assign and track follow-up tasks for newcomers, prayer requests, hospital visits, and discipleship. Make sure nobody falls through the cracks.",
  },
  {
    icon: Building2,
    title: "Department Management",
    description: "Organize church departments, assign leaders, and monitor team health across all branches from a single unified dashboard.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Get real-time insights with visual dashboards. Track growth, attendance trends, engagement metrics, and newcomer conversion rates instantly.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)]">Run Your Church</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Powerful, intuitive tools designed specifically for modern ministries. Spend less time on administration and more time on pastoring.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-[var(--brand-blue)]/30 hover:shadow-[0_20px_40px_rgba(10,102,255,0.08)] transition-all duration-500 card-3d"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center mb-6 group-hover:from-[var(--brand-blue)] group-hover:to-[#0954d1] group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-[0_8px_20px_rgba(10,102,255,0.25)]">
                    <feature.icon className="w-7 h-7 text-[var(--brand-blue)] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-[#0B1120] rounded-[2.5rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[var(--brand-blue)]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[var(--brand-green)]/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Ready to streamline your ministry?</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Get full access to all features instantly. No credit card required.</p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
