import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-24">
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--brand-blue)] mb-4">Talk with our team</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              We&apos;re here to help your ministry thrive
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Whether you need a demo, onboarding support, or custom pricing, our team is ready to partner with you.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-2 items-start">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-lg">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Get in touch</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours. We&apos;re excited to learn about your ministry and how we can support your growth.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                    <p className="text-slate-600">flashwebtechnology@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-100 text-purple-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                    <p className="text-slate-600">+234 907 088 5530</p>
                    <p className="text-sm text-slate-400 mt-1">Available for inquiries and support</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Office Location</h3>
                    <p className="text-slate-600">Flashweb Technology</p>
                    <p className="text-slate-600">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10 shadow-2xl">
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-900">First Name</span>
                    <input type="text" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/15" placeholder="John" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-900">Last Name</span>
                    <input type="text" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/15" placeholder="Doe" />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Email Address</span>
                  <input type="email" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/15" placeholder="john@church.com" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Church Name</span>
                  <input type="text" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/15" placeholder="Grace Community Church" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-900">How can we help?</span>
                  <textarea rows={4} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition focus:border-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/15 resize-none" placeholder="Tell us about your needs..."></textarea>
                </label>
                <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[var(--brand-blue)] to-[#0954d1] px-6 py-4 text-base font-bold text-white shadow-[0_16px_40px_rgba(10,102,255,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(10,102,255,0.3)]">
                  <Send className="w-5 h-5" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
