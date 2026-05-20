import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-gradient-to-bl from-[var(--brand-blue)]/10 to-transparent blur-3xl -z-10 rounded-full mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 w-1/2 h-[500px] bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl -z-10 rounded-full mix-blend-multiply" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10 pt-10">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 px-5 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm fade-in-up hover:shadow-md transition-shadow">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Church Assist 2.0 is now live
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-5xl mx-auto fade-in-up" style={{ animationDelay: "100ms" }}>
              The Operating System for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] via-indigo-500 to-purple-600">
                Modern Ministries
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: "200ms" }}>
              Join 500+ forward-thinking churches using our platform to streamline administration, track attendance, and grow their congregations.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500 fade-in-up" style={{ animationDelay: "400ms" }}>No credit card required • 14-day free trial</p>

            {/* Dashboard Mockup Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto fade-in-up perspective-3d" style={{ animationDelay: "500ms" }}>
              <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 transform-gpu rotate-x-[5deg] scale-[0.98] hover:rotate-x-0 hover:scale-100 transition-all duration-700">
                <div className="bg-slate-900 rounded-t-xl p-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="aspect-[16/9] bg-slate-50 rounded-b-xl border-x border-b border-slate-100 relative overflow-hidden flex items-center justify-center">
                  {/* Abstract placeholder for the dashboard UI */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--brand-blue)_0%,_transparent_100%)]"></div>
                  <Image src="/logo-church-assist.png" alt="Church Assist Dashboard Preview" width={2000} height={581} className="h-20 w-auto opacity-50 grayscale" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="py-10 border-y border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by growing churches worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-50 grayscale">
              <span className="font-serif text-2xl font-bold">Grace Chapel</span>
              <span className="font-serif text-2xl font-bold">Elevation</span>
              <span className="font-serif text-2xl font-bold">Hillsong</span>
              <span className="font-serif text-2xl font-bold">CityLight</span>
              <span className="font-serif text-2xl font-bold">FaithPoint</span>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
