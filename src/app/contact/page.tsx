import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Let&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-blue)] to-purple-500">Connect</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about Church Assist? Need help setting up your congregation? Our dedicated support team is here to help.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">Get in touch</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Fill out the form and our team will get back to you within 24 hours. We&apos;re excited to learn about your ministry and how we can support your growth.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                    <p className="text-slate-600">flashwebtechnology@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
                    <p className="text-slate-600">+234 907 088 5530</p>
                    <p className="text-sm text-slate-400 mt-1">Available for inquiries and support</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Office Location</h3>
                    <p className="text-slate-600">Flashweb Technology</p>
                    <p className="text-slate-600">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="john@church.com" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Church Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="Grace Community Church" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">How can we help?</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none" placeholder="Tell us about your needs..."></textarea>
                </div>
                
                <button type="button" className="w-full bg-gradient-to-r from-[var(--brand-blue)] to-[#0954d1] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[var(--brand-blue)]/30 hover:-translate-y-0.5 transition-all duration-300">
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
