"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDarkMode } from "@/lib/dark-mode-context";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/benefits", label: "Benefits" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-[var(--brand-border)]/70'} backdrop-blur-xl border-b shadow-[0_16px_60px_rgba(15,23,42,0.08)] transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-church-assist.png"
              alt="Church Assist"
              width={2000}
              height={581}
              className="h-10 w-auto transition-opacity duration-200 hover:opacity-80"
              loading="eager"
              priority
            />
          </Link>

          <div className={`hidden md:flex items-center gap-10 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[var(--brand-blue)]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${darkMode ? 'border-slate-700 bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              href="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${darkMode ? 'text-slate-200 hover:text-[var(--brand-blue)]' : 'text-slate-700 hover:text-[var(--brand-blue)]'}`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-blue-dark)] px-6 py-2.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(10,102,255,0.2)] hover:shadow-[0_8px_25px_rgba(10,102,255,0.35)] hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`inline-flex items-center justify-center rounded-2xl border p-3 shadow-sm transition md:hidden ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-300 bg-white text-slate-700 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]'}`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-x-0 top-20 z-40 overflow-hidden backdrop-blur-xl transition-all duration-300 md:hidden ${open ? "max-h-[calc(100vh-5rem)] opacity-100" : "max-h-0 opacity-0"} ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'}`}
        style={{ boxShadow: "0 30px 60px rgba(15,23,42,0.12)" }}
      >
        <div className="mx-auto max-w-7xl px-4 px-4 sm:px-6">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-3xl border px-5 py-4 text-base font-semibold transition ${darkMode ? 'border-slate-800 bg-slate-800 text-slate-200 hover:border-[var(--brand-blue)] hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-[var(--brand-blue)] hover:bg-white'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`block rounded-3xl px-5 py-4 text-center text-base font-semibold transition ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block rounded-3xl bg-[var(--brand-blue)] px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-[var(--brand-blue-dark)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
