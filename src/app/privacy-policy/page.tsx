import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-slate-900 selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500 mb-4">Privacy Policy</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">How Church Assist protects your church's data</h1>
            <p className="text-lg leading-relaxed text-slate-600 mb-8">
              Your trust matters. We build our platform to keep member data safe, private, and accessible only to your authorized ministry team.
            </p>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold mb-3">What information we collect</h2>
                <p className="leading-relaxed">We collect only the information required to run your church operations: member profiles, attendance, giving history, and communication records. We do not sell your data.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">How we use your data</h2>
                <p className="leading-relaxed">Data is used to power the platform, improve accuracy, support reporting, and keep your ministry running smoothly. Your information is only accessible to your organization and authorized administrators.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">Security measures</h2>
                <p className="leading-relaxed">We use strong encryption, access controls, and secure hosting to protect your information. Regular backups and monitoring help ensure service availability and durability.</p>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-3">Your rights</h2>
                <p className="leading-relaxed">You can request access to your data, correct records, or request deletion for personal data when needed. Contact our support team through the dashboard or via the contact page.</p>
              </section>
            </div>

            <div className="mt-10 text-sm text-slate-500">
              <p>Last updated: May 2026</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-[var(--brand-blue)] font-semibold hover:underline">Back to home</Link>
            <Link href="/terms-of-service" className="text-slate-500 hover:text-slate-900 hover:underline">Read Terms of Service</Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
