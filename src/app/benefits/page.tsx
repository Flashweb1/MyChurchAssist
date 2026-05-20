import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { CheckCircle2, ShieldCheck, Zap, Heart } from "lucide-react";

const benefits = [
  "No more scattered spreadsheets or lost paper records",
  "Real-time data synchronization across all your devices",
  "Beautiful, modern interface that requires zero training",
  "Works flawlessly on mobile, tablet, and desktop",
  "Bank-level secure cloud-based storage",
  "Built specifically for the unique needs of churches",
];

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <Heart className="w-4 h-4 fill-emerald-700" />
              Why Choose Us
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Designed to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Empower</span> Your Ministry
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We built Church Assist because church administrators deserve better than generic spreadsheets, sticky notes, and scattered systems.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
                The modern way to manage your congregation
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 perspective-3d">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8 transform-gpu hover:-translate-y-2 hover:rotate-y-2 transition-all duration-500 relative overflow-hidden float-3d">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 -mt-10 -mr-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -mb-10 -ml-10" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl">Peace of Mind</h3>
                    <p className="text-slate-500 text-sm">Automated backups & security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-full w-full" />
                  <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                  <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                </div>

                <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-700">Performance</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
