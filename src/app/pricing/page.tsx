import Link from "next/link";
import {
  Check,
  Star,
  ArrowRight,
  X,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for small churches getting started",
    features: [
      "Up to 100 members",
      "Basic member management",
      "Attendance tracking",
      "Mobile app access",
      "Email support",
    ],
    limitations: [
      "Limited to 1 branch",
      "Basic reports only",
      "No custom branding",
    ],
    popular: false,
    cta: "Get Started Free",
    ctaLink: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Ideal for growing churches with multiple branches",
    features: [
      "Unlimited members",
      "Advanced member management",
      "Multi-branch support",
      "Follow-up system",
      "Custom reports & analytics",
      "Department management",
      "Priority email support",
      "Data export",
    ],
    limitations: [],
    popular: true,
    cta: "Start Free Trial",
    ctaLink: "/signup",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large churches and organizations",
    features: [
      "Everything in Pro",
      "Unlimited branches",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated account manager",
      "Phone & priority support",
      "Custom training",
      "White-label option",
      "API access",
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales",
    ctaLink: "/contact",
  },
];

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Start with our Pro plan free trial for 14 days. No credit card required.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel anytime with no penalties. Your data remains accessible until the end of your billing period.",
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer: "Yes! Churches and non-profit organizations receive 20% off all plans. Contact us for details.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--brand-navy)] tracking-tight leading-tight mb-6">
            Choose the Perfect Plan for{" "}
            <span className="text-[var(--brand-blue)]">Your Church</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--brand-muted)] max-w-2xl mx-auto leading-relaxed">
            Start free and scale as you grow. All plans include our core features with no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl shadow-lg border transition-all hover:shadow-xl ${
                  plan.popular
                    ? "border-[var(--brand-blue)] ring-2 ring-[var(--brand-blue)]/20 scale-105"
                    : "border-[var(--brand-border)] hover:border-[var(--brand-blue)]/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--brand-blue)] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-[var(--brand-navy)]">{plan.price}</span>
                      <span className="text-[var(--brand-muted)]">{plan.period}</span>
                    </div>
                    <p className="text-[var(--brand-muted)]">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[var(--brand-green)] shrink-0" />
                        <span className="text-[var(--brand-navy)]">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <X className="w-5 h-5 text-red-400 shrink-0" />
                        <span className="text-[var(--brand-muted)] line-through">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-center block transition-all ${
                      plan.popular
                        ? "bg-[var(--brand-blue)] text-white hover:bg-[#0954d1] shadow-lg"
                        : "bg-[var(--brand-bg)] text-[var(--brand-navy)] hover:bg-[var(--brand-border)] border border-[var(--brand-border)]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--brand-navy)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Compare All Features
            </h2>
            <p className="text-lg text-[var(--brand-bg)]/75 max-w-2xl mx-auto">
              See exactly what&apos;s included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl">
              <thead>
                <tr className="border-b border-[var(--brand-border)]">
                  <th className="text-left p-6 font-semibold text-[var(--brand-navy)]">Features</th>
                  <th className="text-center p-6 font-semibold text-[var(--brand-navy)]">Free</th>
                  <th className="text-center p-6 font-semibold text-[var(--brand-blue)]">Pro</th>
                  <th className="text-center p-6 font-semibold text-[var(--brand-navy)]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Members", "100", "Unlimited", "Unlimited"],
                  ["Branches", "1", "5", "Unlimited"],
                  ["Reports", "Basic", "Advanced", "Custom"],
                  ["Support", "Email", "Priority Email", "Phone + Dedicated"],
                  ["API Access", "✗", "✗", "✓"],
                  ["White-label", "✗", "✗", "✓"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[var(--brand-border)]">
                    <td className="p-6 font-medium text-[var(--brand-navy)]">{row[0]}</td>
                    <td className="p-6 text-center text-[var(--brand-muted)]">{row[1]}</td>
                    <td className="p-6 text-center text-[var(--brand-blue)] font-semibold">{row[2]}</td>
                    <td className="p-6 text-center text-[var(--brand-muted)]">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-navy)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[var(--brand-muted)]">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-[var(--brand-border)]">
                <h3 className="text-lg font-semibold text-[var(--brand-navy)] mb-2">{faq.question}</h3>
                <p className="text-[var(--brand-muted)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(135deg,_#0A66FF_0%,_#22C55E_100%)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/85 mb-8 max-w-2xl mx-auto">
            Join hundreds of churches already using Church Assist to streamline their operations and grow their congregation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-[var(--brand-blue)] hover:bg-slate-100 px-8 py-3.5 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto border-2 border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}