import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-slate-900 selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500 mb-4">Terms of Service</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Church Assist terms for using the platform</h1>
            <p className="text-lg leading-relaxed text-slate-600 mb-8">
              These terms explain how you can use Church Assist, what we provide, and how we support your church with a secure ministry operations platform.
            </p>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Use of the platform</h2>
                <p className="leading-relaxed">You may use Church Assist to manage church members, attendance, giving, communications, and ministry operations under your account. Your use must comply with applicable laws and our community expectations.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">Accounts and access</h2>
                <p className="leading-relaxed">Account holders are responsible for the security of their login credentials and for managing access for team members. Do not share your account credentials publicly.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">Payments and cancellations</h2>
                <p className="leading-relaxed">Paid plans are billed as agreed at signup. You can cancel or change your plan at any time. Any refund policies will be described at checkout or in your subscription agreement.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">Limitation of liability</h2>
                <p className="leading-relaxed">Our service is provided as-is, and we are not responsible for indirect damages. We strive for uptime and reliability, but do not guarantee uninterrupted access.</p>
              </section>
            </div>

            <div className="mt-10 text-sm text-slate-500">
              <p>Last updated: May 2026</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-[var(--brand-blue)] font-semibold hover:underline">Back to home</Link>
            <Link href="/privacy-policy" className="text-slate-500 hover:text-slate-900 hover:underline">Read Privacy Policy</Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
