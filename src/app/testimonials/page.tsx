import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Star, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    name: "Pastor David Johnson",
    role: "Senior Pastor",
    church: "Grace Community Church",
    content: "Church Assist has transformed how we manage our congregation. What used to take hours of manual data entry now takes minutes.",
    avatar: "DJ",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Sarah Martinez",
    role: "Administrative Director",
    church: "City Light Church",
    content: "The newcomer follow-up system is simply incredible. Our membership retention has grown by 40% since we started using Church Assist.",
    avatar: "SM",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Rev. Michael Chen",
    role: "Lead Pastor",
    church: "Hope Fellowship",
    content: "Beautiful interface, powerful features, and excellent support. I highly recommend this platform for any growing church.",
    avatar: "MC",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Emily Thompson",
    role: "Youth Ministry Leader",
    church: "Elevate Church",
    content: "Everything is centralized now. Taking attendance on my phone during service is a game-changer.",
    avatar: "ET",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "James Wilson",
    role: "Executive Pastor",
    church: "New Beginnings",
    content: "The reporting analytics are top-tier. I can pull up our weekly attendance and newcomer conversion rates in seconds.",
    avatar: "JW",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Maria Rodriguez",
    role: "Volunteer Coordinator",
    church: "Faith Chapel",
    content: "Scheduling and communicating with workers has never been easier. The messaging feature lets me send targeted announcements instantly.",
    avatar: "MR",
    color: "bg-teal-100 text-teal-700",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] selection:bg-[var(--brand-blue)]/20">
      <PublicNavbar />
      
      <main className="pt-32 pb-24">
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-700 mb-6">
              <Star className="w-4 h-4" />
              Real churches, real results
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Loved by church leaders <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">worldwide</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See how Church Assist is helping churches reduce administrative work, nurture visitors, and keep their ministry moving forward.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <Quote className="absolute right-6 top-6 h-12 w-12 text-slate-100 opacity-10" />
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${testimonial.color}`}>{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-[var(--brand-blue)]">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">{testimonial.church}</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">“{testimonial.content}”</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-r from-slate-900 to-indigo-700 p-12 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300 mb-4">Success that scales</p>
                <h2 className="text-3xl sm:text-4xl font-bold">Join churches that are already working smarter with Church Assist.</h2>
                <p className="mt-5 text-lg text-slate-200 max-w-2xl leading-relaxed">From small congregations to growing ministries, our platform helps every team stay organized and connected.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/signup" className="rounded-3xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 text-center shadow-lg hover:opacity-95">
                  Start free today
                </Link>
                <Link href="/contact" className="rounded-3xl border border-white/30 px-8 py-4 text-lg font-semibold text-white text-center hover:bg-white/10">
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
