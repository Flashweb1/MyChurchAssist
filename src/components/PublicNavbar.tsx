"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/benefits", label: "Benefits" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[var(--brand-border)]/70 shadow-[0_16px_60px_rgba(15,23,42,0.08)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-2xl p-1">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-green)] opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
              <Image
                src="/logo-church-assist.png"
                alt="Church Assist"
                width={2000}
                height={581}
                className="h-10 w-auto relative z-10 transition-transform duration-300 group-hover:scale-105"
                loading="eager"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[var(--brand-blue)]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[var(--brand-blue)] px-4 py-2 rounded-xl transition-all"
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
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white p-3 text-slate-700 shadow-sm transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-x-0 top-20 z-40 overflow-hidden bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden ${open ? "max-h-[calc(100vh-5rem)] opacity-100" : "max-h-0 opacity-0"}`}
        style={{ boxShadow: "0 30px 60px rgba(15,23,42,0.12)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-semibold text-slate-800 transition hover:border-[var(--brand-blue)] hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-slate-800"
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
