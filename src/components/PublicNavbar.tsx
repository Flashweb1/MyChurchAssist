import Link from "next/link";
import Image from "next/image";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--brand-border)]/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl p-1">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105" loading="eager" priority />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/features" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand-blue)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-blue)] hover:after:w-full after:transition-all after:duration-300">Features</Link>
            <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand-blue)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-blue)] hover:after:w-full after:transition-all after:duration-300">Pricing</Link>
            <Link href="/testimonials" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand-blue)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-blue)] hover:after:w-full after:transition-all after:duration-300">Testimonials</Link>
            <Link href="/benefits" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand-blue)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-blue)] hover:after:w-full after:transition-all after:duration-300">Benefits</Link>
            <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand-blue)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-blue)] hover:after:w-full after:transition-all after:duration-300">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 hover:text-[var(--brand-blue)] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold text-white bg-gradient-to-r from-[var(--brand-blue)] to-[#0954d1] hover:from-[#0954d1] hover:to-[#0954d1] px-6 py-2.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(10,102,255,0.25)] hover:shadow-[0_8px_25px_rgba(10,102,255,0.4)] hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
