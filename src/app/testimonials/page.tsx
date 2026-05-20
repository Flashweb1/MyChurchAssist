import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Pastor David Johnson",
    role: "Senior Pastor",
    church: "Grace Community Church",
    content: "Church Assist has transformed how we manage our congregation. What used to take hours of manual data entry now takes minutes. Our administrative team can finally focus on actual ministry instead of paperwork.",
    avatar: "DJ",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Sarah Martinez",
    role: "Administrative Director",
    church: "City Light Church",
    content: "The newcomer follow-up system is simply incredible. We never miss an opportunity to connect with first-time visitors anymore. Our membership retention has grown by 40% since we started using Church Assist.",
    avatar: "SM",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Rev. Michael Chen",
    role: "Lead Pastor",
    church: "Hope Fellowship",
    content: "Beautiful interface, powerful features, and excellent support. The developers truly understand what modern churches need. I highly recommend this platform for any growing church looking to scale their operations.",
    avatar: "MC",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Emily Thompson",
    role: "Youth Ministry Leader",
    church: "Elevate Church",
    content: "Managing our youth department used to be a nightmare of group chats and spreadsheets. Now, everything is centralized. Taking attendance on my phone during service is a game-changer.",
    avatar: "ET",
    color: "bg-amber-100 text-amber-700",
  },
  {
    name: "James Wilson",
    role: "Executive Pastor",
    church: "New Beginnings",
    content: "The reporting analytics are top-tier. I can pull up our weekly attendance and newcomer conversion rates in seconds for our board meetings. It's exactly what we needed to track our church health.",
    avatar: "JW",
    color: "bg-pink-100 text-pink-700",
  },
  {
    name: "Maria Rodriguez",
    role: "Volunteer Coordinator",
    church: "Faith Chapel",
    content: "Scheduling and communicating with workers has never been easier. The messaging feature lets me send targeted announcements just to the ushering or choir departments instantly.",
    avatar: "MR",
    color: "bg-teal-100 text-teal-700",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-amber-700" />
              Success Stories
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              Loved by Church Leaders <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">Worldwide</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Don&apos;t just take our word for it. Read how Church Assist is helping ministries around the globe streamline operations and grow their congregations.
            </p>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="px-4 sm:px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                >
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 -z-0" />
                  
                  <div className="flex items-center gap-1 mb-6 relative z-10">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-slate-700 mb-8 leading-relaxed relative z-10 font-medium">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${testimonial.color}`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-[var(--brand-blue)] font-medium">{testimonial.role}</p>
                      <p className="text-xs text-slate-500">{testimonial.church}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
