import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    quote: "I used to get sick every month at my old mess. After switching to a TrustBite verified mess with H:9.2, I haven't had a single stomach issue in 4 months.",
    name: 'Rohan M.',
    college: 'B.Tech · NIT Nagpur',
    avatar: 'R',
    avatarBg: 'bg-orange-500',
    featured: false,
  },
  {
    quote: "The hygiene scores are actually accurate — I visited three messes after checking TrustBite and the cleanliness matched exactly what the app showed. This is wild.",
    name: 'Priya S.',
    college: 'MBA · Symbiosis Pune',
    avatar: 'P',
    avatarBg: 'bg-emerald-500',
    featured: true,
  },
  {
    quote: "Best thing about TrustBite? I can filter by price AND hygiene score together. Found a ₹70/meal mess with H:9.1 score within walking distance. Changed my life.",
    name: 'Aarav K.',
    college: 'B.Com · DU Delhi',
    avatar: 'A',
    avatarBg: 'bg-blue-500',
    featured: false,
  },
];

const scrollNames = [
  'Anjali from BITS', 'Farhan from IIT-B', 'Sneha from MIT Pune', 'Karan from VIT',
  'Deepa from NIT Trichy', 'Ravi from VNIT', 'Meera from IIM-A', 'Siddharth from COEP',
  'Nikita from Christ University', 'Arjun from IIIT Hyderabad', 'Tanvi from Manipal',
  'Omkar from PICT Pune',
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden" style={{ background: '#FFF8F2' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-orange-100 mb-6">
            ✦ Student Voices
          </span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#111827] mb-4 leading-tight">
            <span className="text-orange-500">18,000</span> Students Trust TrustBite
          </h2>
          <p className="text-[#6B7280] text-lg max-w-md mx-auto">
            Real students. Real messes. Real confidence.
          </p>
        </motion.div>

        {/* 3-column testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`${t.featured ? 'md:-translate-y-3' : ''}`}
            >
              <div
                className={`bg-white rounded-[20px] p-7 lg:p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  t.featured ? 'border-2 border-orange-400' : 'border border-slate-100'
                }`}
                style={{ boxShadow: t.featured ? '0 8px 40px rgba(249,115,22,0.12)' : '0 4px 20px rgba(249,115,22,0.07)' }}
              >
                {/* Featured badge */}
                {t.featured && (
                  <span className="inline-flex items-center gap-1 self-start bg-orange-50 text-orange-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
                    ⭐ Featured Review
                  </span>
                )}

                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#374151] text-[15px] leading-relaxed italic flex-1 mb-6">
                  "{t.quote}"
                </p>

                {/* Divider */}
                <div className="h-px bg-slate-100 mb-5" />

                {/* Student info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111827]">{t.name}</p>
                      <p className="text-xs text-[#6B7280]">{t.college}</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scrolling ticker */}
        <div className="relative overflow-hidden py-4">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FFF8F2] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FFF8F2] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 animate-scroll-left">
            {[...scrollNames, ...scrollNames].map((name, i) => (
              <span key={`${name}-${i}`} className="flex-shrink-0 text-sm text-[#9CA3AF] font-medium whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
