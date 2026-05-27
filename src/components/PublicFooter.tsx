import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

interface IconProps {
  className?: string;
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TiktokIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

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
              <Link href="https://linkedin.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="LinkedIn">
                <LinkedinIcon className="w-5 h-5" />
              </Link>
              <Link href="https://tiktok.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="TikTok">
                <TiktokIcon className="w-5 h-5" />
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </Link>
              <Link href="mailto:info@churchassist.app" className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="Email">
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
