"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Check,
  Star,
  ArrowRight,
  X,
  ChevronDown,
  Globe,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { detectCountry, getCurrencyForCountry, getExchangeRate } from "@/lib/geo";
import { COUNTRIES } from "@/lib/currency";

const CURRENCY_OPTIONS = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

function getCountryFromCurrency(code: string): string {
  for (const [country, cfg] of Object.entries(COUNTRIES)) {
    if (cfg.currency === code) return country;
  }
  return "US";
}

const TIERS = [
  {
    name: "Starter",
    priceNGN: 0,
    period: "forever",
    description: "For small churches getting started",
    popular: false,
    features: [
      "Up to 100 members",
      "1 branch",
      "Basic member management",
      "Attendance tracking",
      "Mobile app access",
      "Basic reports",
      "Email support",
    ],
    limitations: ["Limited to 1 branch", "Basic reports only", "No custom branding"],
    cta: "Get Started Free",
    ctaLink: "/signup",
  },
  {
    name: "Small",
    priceNGN: 4500,
    period: "per month",
    description: "Perfect for growing churches",
    popular: false,
    features: [
      "Up to 500 members",
      "Up to 3 branches",
      "Everything in Starter",
      "Follow-up system",
      "Department management",
      "Priority email support",
    ],
    limitations: [],
    cta: "Start Free Trial",
    ctaLink: "/signup",
  },
  {
    name: "Medium",
    priceNGN: 7500,
    period: "per month",
    description: "Best value for thriving churches",
    popular: true,
    features: [
      "Up to 1,000 members",
      "Up to 5 branches",
      "Everything in Small",
      "Advanced reports & analytics",
      "Custom branding",
      "Data export",
    ],
    limitations: [],
    cta: "Start Free Trial",
    ctaLink: "/signup",
  },
  {
    name: "Large",
    priceNGN: 15000,
    period: "per month",
    description: "For multi-branch organizations",
    popular: false,
    features: [
      "Up to 5,000 members",
      "Up to 10 branches",
      "Everything in Medium",
      "Custom integrations",
      "API access",
      "Phone support",
    ],
    limitations: [],
    cta: "Start Free Trial",
    ctaLink: "/signup",
  },
  {
    name: "Enterprise",
    priceNGN: 30000,
    period: "per month",
    description: "For large churches & organizations",
    popular: false,
    features: [
      "Unlimited members",
      "Unlimited branches",
      "Everything in Large",
      "Dedicated account manager",
      "White-label option",
      "Custom training",
      "Phone & priority support",
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaLink: "/contact",
  },
];

const COMPARISON_ROWS = [
  ["Members", "100", "500", "1,000", "5,000", "Unlimited"],
  ["Branches", "1", "3", "5", "10", "Unlimited"],
  ["Reports", "Basic", "Basic", "Advanced", "Advanced", "Custom"],
  ["Support", "Email", "Priority Email", "Priority Email", "Phone", "Phone + Dedicated"],
  ["Follow-ups", "✗", "✓", "✓", "✓", "✓"],
  ["Dept. Management", "✗", "✓", "✓", "✓", "✓"],
  ["Custom Branding", "✗", "✗", "✓", "✓", "✓"],
  ["API Access", "✗", "✗", "✗", "✓", "✓"],
  ["White-label", "✗", "✗", "✗", "✗", "✓"],
];

const FAQS = [
  {
    q: "Can I change plans anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Start with any paid plan free for 14 days. No credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel anytime with no penalties. Your data remains accessible until the end of your billing period.",
  },
  {
    q: "What currency are prices shown in?",
    a: "Prices default to Nigerian Naira (₦) but are automatically converted to your local currency based on your location. You can manually select any supported currency.",
  },
  {
    q: "Do you offer discounts for non-profits?",
    a: "Yes! Churches and non-profit organizations receive 20% off all paid plans. Contact us for details.",
  },
];

function formatLocalPrice(amount: number, symbol: string, locale: string, currency: string): string {
  if (amount === 0) return `${symbol}0`;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toLocaleString()}`;
  }
}

export default function PricingPage() {
  const [currency, setCurrency] = useState("NGN");
  const [rate, setRate] = useState(1);
  const [currencyInfo, setCurrencyInfo] = useState({ symbol: "₦", locale: "en-NG", currency: "NGN" });
  const [rateLoading, setRateLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setRateLoading(true);
      const saved = localStorage.getItem("church-assist-currency");
      let targetCode = "NGN";
      if (saved && CURRENCY_OPTIONS.some((c) => c.code === saved)) {
        targetCode = saved;
      } else {
        const country = await detectCountry();
        const info = getCurrencyForCountry(country);
        targetCode = info.currency;
      }
      setCurrency(targetCode);
      const country = getCountryFromCurrency(targetCode);
      const info = getCurrencyForCountry(country);
      setCurrencyInfo({ symbol: info.symbol, locale: info.locale, currency: info.currency });
      if (targetCode !== "NGN") {
        try {
          const r = await getExchangeRate("NGN", targetCode);
          setRate(r || 1);
        } catch {
          setRate(1);
        }
      } else {
        setRate(1);
      }
      setRateLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCurrencyChange = async (code: string) => {
    localStorage.setItem("church-assist-currency", code);
    setCurrency(code);
    setPickerOpen(false);
    setRateLoading(true);
    const country = getCountryFromCurrency(code);
    const info = getCurrencyForCountry(country);
    setCurrencyInfo({ symbol: info.symbol, locale: info.locale, currency: info.currency });
    if (code !== "NGN") {
      try {
        const r = await getExchangeRate("NGN", code);
        setRate(r || 1);
      } catch {
        setRate(1);
      }
    } else {
      setRate(1);
    }
    setRateLoading(false);
  };

  const getPrice = (priceNGN: number) => Math.round(priceNGN * rate);

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-5 py-2 text-sm font-semibold text-[var(--brand-blue)] mb-6">
            <Star className="w-4 h-4" />
            Transparent pricing that grows with you
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Simple plans for churches of every size
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Start free, upgrade when you need more, and keep everything focused on ministry
            impact&mdash;not confusing billing.
          </p>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-12 gap-3">
            <Globe className="w-4.5 h-4.5 text-slate-400" />
            <span className="text-sm text-slate-500 font-medium">Display prices in:</span>
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setPickerOpen(!pickerOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {currencyInfo.symbol} {currency}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
              </button>
              {pickerOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {CURRENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => handleCurrencyChange(opt.code)}
                      className={`flex items-center gap-3 w-full px-5 py-3.5 text-sm transition-colors text-left ${
                        currency === opt.code
                          ? "bg-[var(--brand-blue)]/5 text-[var(--brand-blue)] font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-lg w-8 text-center">{opt.symbol}</span>
                      <span className="font-medium">{opt.code}</span>
                      <span className="text-slate-400">{opt.name}</span>
                      {currency === opt.code && <span className="ml-auto text-xs bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] px-2 py-0.5 rounded-full">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
            {TIERS.map((tier, i) => {
              const price = getPrice(tier.priceNGN);
              const isFree = tier.priceNGN === 0;
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-[2rem] border transition-all shadow-xl flex flex-col ${
                    tier.popular
                      ? "border-[var(--brand-blue)] bg-white ring-2 ring-[var(--brand-blue)]/20 scale-[1.03] z-10"
                      : "border-[var(--brand-border)] bg-white"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-lg whitespace-nowrap">
                      Best Value
                    </div>
                  )}

                  <div className="p-6 pt-14 flex flex-col flex-1">
                    <div className="text-center mb-5">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                      <div className="flex items-baseline justify-center gap-1.5 text-slate-900">
                        <span className="text-4xl font-black">
                          {rateLoading
                            ? "---"
                            : isFree
                              ? `${currencyInfo.symbol}0`
                              : formatLocalPrice(price, currencyInfo.symbol, currencyInfo.locale, currencyInfo.currency)}
                        </span>
                        <span className="text-sm text-slate-500">{tier.period}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tier.description}</p>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2.5 text-sm text-slate-700">
                          <Check className="w-4.5 h-4.5 text-[var(--brand-green)] shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {tier.limitations.map((limitation, j) => (
                        <div key={j} className="flex items-center gap-2.5 text-sm text-[var(--brand-muted)]">
                          <X className="w-4.5 h-4.5 text-red-400 shrink-0" />
                          <span className="line-through">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={tier.ctaLink}
                      className={`block rounded-3xl px-5 py-3.5 text-center text-sm font-semibold transition ${
                        tier.popular
                          ? "bg-[var(--brand-blue)] text-white hover:bg-[#0954d1]"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--brand-navy)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Compare everything at a glance</h2>
            <p className="text-lg text-[var(--brand-bg)]/75 max-w-3xl mx-auto">
              Choose the plan that fits your church and upgrade as your ministry grows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-5 font-semibold text-slate-900 whitespace-nowrap">Features</th>
                  {TIERS.map((t, i) => (
                    <th
                      key={i}
                      className={`text-center p-5 font-semibold whitespace-nowrap ${
                        t.popular ? "text-[var(--brand-blue)]" : "text-slate-900"
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-200 last:border-0">
                    <td className="p-5 font-medium text-slate-900 whitespace-nowrap">{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td
                        key={j}
                        className={`p-5 text-center ${
                          TIERS[j]?.popular ? "text-[var(--brand-blue)] font-semibold" : "text-slate-600"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-[var(--brand-muted)]">Everything you need to know about our pricing.</p>
          </div>

          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(135deg,_#0A66FF_0%,_#22C55E_100%)]">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to choose the right plan for your church?</h2>
          <p className="text-lg mb-10 text-white/90">
            Get started with a modern church management system and see how Church Assist can simplify
            your ministry operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-8 py-4 text-lg font-semibold text-[var(--brand-blue)] shadow-xl hover:opacity-95"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-3xl border border-white/70 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
