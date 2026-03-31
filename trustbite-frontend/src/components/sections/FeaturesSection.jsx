import { motion } from 'framer-motion';
import { Shield, Star, FileCheck, Activity, IndianRupee, LayoutDashboard, Sparkles, GraduationCap, Cpu } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: '#F9F5F0' }}>
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
            ✦ Why TrustBite
          </span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#111827] mb-4 leading-tight">
            Everything a Student Needs<br className="hidden sm:block" /> to <span className="text-orange-500">Eat Right</span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-md mx-auto">
            We built the tools no mess-finder ever had.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* LARGE HERO CARD — spans 1 col, 2 rows on md+ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:row-span-2 group"
          >
            <div
              className="relative rounded-[20px] p-8 lg:p-10 h-full overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #F97316 0%, #EA580C 100%)',
                boxShadow: '0 8px 40px rgba(249,115,22,0.25)',
              }}
            >
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
              />

              {/* Icon */}
              <div className="relative z-10 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <div className="relative">
                    <Shield className="w-8 h-8 text-white" />
                    <Cpu className="w-4 h-4 text-white/80 absolute -bottom-1 -right-1" />
                  </div>
                </div>
              </div>

              <h3 className="font-display font-bold text-2xl text-white mb-3 relative z-10">AI-Powered Trust Scores</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8 relative z-10">
                Our AI analyzes 50+ hygiene signals, student reviews, FSSAI compliance data and inspection history to give every mess a living, breathing Trust Score — updated in real time.
              </p>

              {/* TrustAI pill */}
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 text-white text-xs px-3 py-1.5 rounded-full font-bold relative z-10">
                <Sparkles className="w-3.5 h-3.5" /> Powered by TrustAI™
              </span>

              {/* Decorative shield bg */}
              <Shield className="absolute -bottom-8 -right-8 w-40 h-40 text-white/[0.06] rotate-12 pointer-events-none" />
            </div>
          </motion.div>

          {/* MEDIUM CARD 1 — top right */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="group"
          >
            <div
              className="bg-white rounded-[20px] p-7 lg:p-8 h-full border border-slate-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="relative">
                    <Star className="w-6 h-6 text-orange-500" />
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400 absolute -top-1 -right-2" />
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">Verified</span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#111827] mb-2">Verified Student Reviews</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                Only students who've actually eaten there can review. Fake reviews get automatically flagged.
              </p>
              <span className="font-mono text-xs font-bold text-orange-500">240,000+ verified reviews</span>
            </div>
          </motion.div>

          {/* MEDIUM CARD 2 — middle right */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="group"
          >
            <div
              className="bg-white rounded-[20px] p-7 lg:p-8 h-full border border-slate-100 hover:border-[#0F172A]/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(15,23,42,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#0F172A]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6 text-[#0F172A]" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#22C55E] bg-emerald-50 px-2.5 py-1 rounded-full">
                  FSSAI Integrated
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#111827] mb-2">FSSAI License Checker</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Instantly see if a mess has a valid FSSAI food license before you step inside. Government-verified data at your fingertips.
              </p>
            </div>
          </motion.div>

          {/* 3 SMALL CARDS — bottom row */}
          {[
            {
              icon: <Activity className="w-5 h-5 text-orange-500" />,
              title: 'Real-time Hygiene Updates',
              desc: 'Scores update live based on recent inspections and student feedback.',
              color: 'bg-orange-50',
            },
            {
              icon: <IndianRupee className="w-5 h-5 text-emerald-600" />,
              title: 'Price Transparency',
              desc: 'See ₹/meal upfront for every mess. No hidden charges, no surprises.',
              color: 'bg-emerald-50',
            },
            {
              icon: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
              title: 'Owner Dashboard',
              desc: 'Mess owners claim and manage listings, respond to reviews, track growth.',
              color: 'bg-blue-50',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24 + i * 0.08 }}
              className="group"
            >
              <div
                className="bg-white rounded-[20px] p-6 lg:p-7 h-full border border-slate-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'}
              >
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-display font-bold text-base text-[#111827] mb-2">{card.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
