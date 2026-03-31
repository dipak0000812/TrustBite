import { motion } from 'framer-motion';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const messes = [
  {
    name: 'Shree Sai Mess', cuisine: 'Maharashtrian', price: 80, rating: 4.7, hygiene: 9.2,
    tags: [{ label: 'FSSAI ✓', color: 'bg-emerald-50 text-emerald-600' }, { label: 'Veg Only', color: 'bg-emerald-50 text-emerald-600' }, { label: 'Student Fav ⚡', color: 'bg-orange-50 text-orange-600' }],
    gradient: 'from-orange-400 to-amber-300',
  },
  {
    name: 'Annapoorna Bhojanalay', cuisine: 'South Indian', price: 65, rating: 4.5, hygiene: 8.8,
    tags: [{ label: 'FSSAI ✓', color: 'bg-emerald-50 text-emerald-600' }, { label: 'Budget', color: 'bg-blue-50 text-blue-600' }],
    gradient: 'from-rose-400 to-orange-300',
  },
  {
    name: 'Gurudev Mess', cuisine: 'North Indian', price: 95, rating: 4.9, hygiene: 9.5,
    tags: [{ label: 'FSSAI ✓', color: 'bg-emerald-50 text-emerald-600' }, { label: 'Top Rated', color: 'bg-orange-50 text-orange-600' }, { label: 'Veg + Non-Veg', color: 'bg-slate-100 text-slate-600' }],
    gradient: 'from-amber-400 to-yellow-300',
  },
  {
    name: 'Sai Krupa Dining', cuisine: 'Gujarati', price: 75, rating: 4.6, hygiene: 9.0,
    tags: [{ label: 'Veg Only', color: 'bg-emerald-50 text-emerald-600' }, { label: 'Home Style', color: 'bg-orange-50 text-orange-600' }],
    gradient: 'from-emerald-400 to-teal-300',
  },
];

export default function FeaturedMessSection() {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-orange-100 mb-6">
              ✦ Popular Near You
            </span>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#111827] leading-tight">
              Top-Rated Messes <span className="text-orange-500">This Week</span>
            </h2>
            <p className="text-[#6B7280] text-lg mt-3">
              Verified hygiene. Real reviews. Trusted by thousands.
            </p>
          </div>
          <Link to="/discover" className="flex items-center gap-1.5 text-orange-500 font-bold text-sm hover:gap-3 transition-all whitespace-nowrap">
            View All Messes <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Scrollable card row */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {messes.map((mess, i) => (
            <motion.div
              key={mess.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex-shrink-0 w-[280px] snap-start group"
            >
              <div
                className="bg-white rounded-[20px] overflow-hidden border border-slate-100 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col"
                style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(249,115,22,0.16)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)'}
              >
                {/* Gradient banner */}
                <div className={`relative h-36 bg-gradient-to-br ${mess.gradient} flex items-center justify-center`}>
                  <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">🍛</span>
                  {/* Hygiene badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <span className="text-xs font-bold text-[#22C55E]">H: {mess.hygiene}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-base text-[#111827] mb-1 group-hover:text-orange-500 transition-colors">{mess.name}</h3>
                  <p className="text-[#6B7280] text-xs mb-3">{mess.cuisine} · ₹{mess.price}/meal</p>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < Math.round(mess.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="ml-1 text-sm font-bold text-[#111827]">{mess.rating}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {mess.tags.map(tag => (
                      <span key={tag.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tag.color}`}>{tag.label}</span>
                    ))}
                  </div>

                  {/* CTA button */}
                  <Link to="/discover"
                    className="mt-auto block text-center py-2.5 rounded-xl border-2 border-slate-100 text-sm font-bold text-[#6B7280] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200">
                    View Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <p className="text-[#6B7280] text-base mb-5">Explore <span className="font-bold text-[#111827]">2,400+</span> verified messes in your city</p>
          <Link to="/discover"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-200 hover:scale-105 active:scale-95">
            <ShieldCheck className="w-5 h-5" />
            Find My Mess
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
