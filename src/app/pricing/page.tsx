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
						Start free, upgrade when you need more, and keep everything focused on ministry impact—not confusing billing.
					</p>
				</div>
			</section>

			<section className="pb-24 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="grid gap-8 lg:grid-cols-3">
						{plans.map((plan, i) => (
							<div
								key={i}
								className={`relative overflow-hidden rounded-[2rem] border transition-all shadow-xl ${
									plan.popular
										? "border-[var(--brand-blue)] bg-white ring-2 ring-[var(--brand-blue)]/20"
										: "border-[var(--brand-border)] bg-white"
								}`}
							>
								{plan.popular && (
									<div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-lg">
										Most Popular
									</div>
								)}

								<div className="p-10 pt-16">
									<div className="text-center mb-6">
										<h3 className="text-3xl font-bold text-slate-900 mb-3">{plan.name}</h3>
										<div className="flex items-baseline justify-center gap-2 text-slate-900">
											<span className="text-5xl font-black">{plan.price}</span>
											<span className="text-base text-slate-500">{plan.period}</span>
										</div>
										<p className="mt-4 text-slate-600">{plan.description}</p>
									</div>

									<div className="space-y-4 mb-10">
										{plan.features.map((feature, j) => (
											<div key={j} className="flex items-center gap-3 text-slate-700">
												<Check className="w-5 h-5 text-[var(--brand-green)]" />
												<span>{feature}</span>
											</div>
										))}
										{plan.limitations.map((limitation, j) => (
											<div key={j} className="flex items-center gap-3 text-[var(--brand-muted)]">
												<X className="w-5 h-5 text-red-400" />
												<span className="line-through">{limitation}</span>
											</div>
										))}
									</div>

									<Link
										href={plan.ctaLink}
										className={`block rounded-3xl px-6 py-4 text-center text-lg font-semibold transition ${
											plan.popular
												? "bg-[var(--brand-blue)] text-white hover:bg-[#0954d1]"
												: "bg-slate-100 text-slate-900 hover:bg-slate-200"
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

			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--brand-navy)]">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Compare everything at a glance</h2>
						<p className="text-lg text-[var(--brand-bg)]/75 max-w-3xl mx-auto">Choose the plan that fits your church and upgrade as your ministry grows.</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
							<thead>
								<tr className="border-b border-slate-200 bg-slate-50">
									<th className="text-left p-6 font-semibold text-slate-900">Features</th>
									<th className="text-center p-6 font-semibold text-slate-900">Free</th>
									<th className="text-center p-6 font-semibold text-[var(--brand-blue)]">Pro</th>
									<th className="text-center p-6 font-semibold text-slate-900">Enterprise</th>
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
									<tr key={i} className="border-b border-slate-200 last:border-0">
										<td className="p-6 font-medium text-slate-900">{row[0]}</td>
										<td className="p-6 text-center text-slate-600">{row[1]}</td>
										<td className="p-6 text-center text-[var(--brand-blue)] font-semibold">{row[2]}</td>
										<td className="p-6 text-center text-slate-600">{row[3]}</td>
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
						{faqs.map((faq, i) => (
							<div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
								<h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
								<p className="text-slate-600">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-[linear-gradient(135deg,_#0A66FF_0%,_#22C55E_100%)]">
				<div className="max-w-5xl mx-auto text-center text-white">
					<h2 className="text-4xl font-bold mb-4">Ready to choose the right plan for your church?</h2>
					<p className="text-lg mb-10 text-white/90">Get started with a modern church management system and see how Church Assist can simplify your ministry operations.</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-8 py-4 text-lg font-semibold text-[var(--brand-blue)] shadow-xl hover:opacity-95">
							Start Free Trial
							<ArrowRight className="w-5 h-5" />
						</Link>
						<Link href="/contact" className="inline-flex items-center justify-center rounded-3xl border border-white/70 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10">
							Contact Sales
						</Link>
					</div>
				</div>
			</section>

			<PublicFooter />
		</div>
	);
}

