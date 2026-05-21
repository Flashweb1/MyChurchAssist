import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Globe, Mail, Share2 } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-200 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(10,102,255,0.18),transparent_60%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/30 mb-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-3">Ready for a premium ministry management experience?</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Get started with Church Assist today.</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="rounded-3xl bg-[var(--brand-blue)] px-7 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(10,102,255,0.25)] transition hover:opacity-95">
                Start free trial
              </Link>
              <Link href="/contact" className="rounded-3xl border border-slate-700 px-7 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/5">
                Talk to sales
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-4 mb-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image src="/logo-church-assist.png" alt="Church Assist" width={2000} height={581} className="h-10 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Church Assist gives your church a modern, secure platform to manage members, attendance, giving, and follow-up without the clutter.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://facebook.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white">
                <Share2 className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white">
                <ExternalLink className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-300">
              <li><Link href="/features" className="transition hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="transition hover:text-white">Pricing</Link></li>
              <li><Link href="/benefits" className="transition hover:text-white">Benefits</Link></li>
              <li><Link href="/testimonials" className="transition hover:text-white">Testimonials</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-300">
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
              <li><span className="cursor-default">Help Center</span></li>
              <li><span className="cursor-default">API Docs</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-300">
              <li><Link href="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="transition hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Church Assist. Built for modern ministries.</p>
          <p className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
