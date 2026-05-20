import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[var(--brand-border)]/50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[var(--brand-blue)] to-transparent opacity-20" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-8 w-auto" />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Modern church management system built to help congregations grow, connect, and thrive in the digital age.
            </p>
            <div className="flex items-center gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[var(--brand-blue)] hover:text-white transition-colors cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[var(--brand-blue)] hover:text-white transition-colors cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[var(--brand-blue)] hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/features" className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors">Pricing</Link></li>
              <li><Link href="/benefits" className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors">Benefits</Link></li>
              <li><Link href="/testimonials" className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors">Contact Us</Link></li>
              <li><span className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors cursor-pointer">API Documentation</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4">
              <li><span className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-sm text-slate-500 hover:text-[var(--brand-blue)] transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Church Assist. Built with love for the church. | By Flashweb Technology
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
