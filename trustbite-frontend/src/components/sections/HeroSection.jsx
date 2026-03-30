import { motion } from 'framer-motion';
import { Search, MapPin, Star, Shield, ChevronRight, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { fadeInUp, scaleIn } from '../../lib/motion';

const FLOATING_CARDS = [
  { name: 'Shree Sai Mess', cuisine: 'Maharashtrian', hygiene: 9.2, rating: 4.7, price: '₹80/meal', tag: 'Top Rated' },
  { name: 'Annapoorna Bhojanalay', cuisine: 'South Indian', hygiene: 8.8, rating: 4.5, price: '₹65/meal', tag: 'Budget' },
  { name: 'Gurudev Mess', cuisine: 'North Indian', hygiene: 9.5, rating: 4.9, price: '₹95/meal', tag: 'Verified' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <section className='relative min-h-screen overflow-hidden'
      style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA6A0A 50%, #F59E0B 100%)' }}>

      {/* Decorative bg elements */}
      <div className="absolute left-0 top-1/4 w-48 opacity-30 pointer-events-none hidden lg:block">
        <div className="text-8xl">🥗</div>
      </div>
      <div className="absolute right-0 top-1/3 w-48 opacity-30 pointer-events-none hidden lg:block">
        <div className="text-8xl">🍱</div>
      </div>
      
      {/* Subtle radial light in center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.15), transparent)' }}
      />

      <div className='relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 min-h-screen flex flex-col items-center justify-center text-center gap-8'>

        {/* Text + Search */}
        <div className='flex flex-col items-center gap-6'>

          {/* Trust badge pill — centered */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible"
            className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 w-fit mx-auto'>
            <Shield size={14} className='text-white' />
            <span className='text-white text-xs font-medium tracking-wide'>India&apos;s First Mess Trust Platform</span>
          </motion.div>

          {/* Headline — centered */}
          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible"
            className='font-display font-extrabold text-white leading-tight'
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Find Messes You Can <br />
            <span className="relative inline-block">
              Actually Trust
              <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-white/40 rounded-full" />
            </span>
          </motion.h1>

          {/* Subheadline — centered, max-w-lg */}
          <motion.p variants={fadeInUp} initial="hidden" animate="visible"
            className='text-white/80 text-lg max-w-lg leading-relaxed'>
            Discover nearby mess services with verified hygiene scores,
            real student reviews, and AI-powered recommendations.
          </motion.p>

          {/* Search Bar — centered, max-w-2xl */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible"
            className='relative mt-2 w-full max-w-2xl mx-auto'>
            <div className='flex items-center bg-white rounded-2xl shadow-2xl shadow-black/10 overflow-hidden'>
              <div className='flex items-center gap-2 px-4 py-4 text-slate-400 border-r border-slate-100'>
                <MapPin size={18} className='text-orange-500' />
                <span className='text-sm text-slate-500 hidden sm:block whitespace-nowrap'>Near me</span>
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search mess, hostel area, cuisine...'
                className='flex-1 px-4 py-4 text-slate-800 placeholder-slate-400 text-sm bg-transparent outline-none font-body'
              />
              <button className='m-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors hover:scale-105 active:scale-95 whitespace-nowrap'>
                <Search size={16} />
                <span className='hidden sm:inline'>Search</span>
              </button>
            </div>
          </motion.div>

          {/* Floating Mess Cards row — centered below search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 w-full max-w-4xl mx-auto">
            {FLOATING_CARDS.map((card, i) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, y: [0, -6, 0] }}
                transition={{
                  opacity: { delay: 0.5 + i * 0.15, duration: 0.5 },
                  y: { delay: 1.2, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="flex-1 bg-white rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-orange-900/20 cursor-pointer hover:scale-105 transition-transform duration-200 text-left relative group"
              >
                <div className='w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0'>
                  <span className='text-orange-500 font-bold text-lg'>🍛</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-slate-900 font-bold text-sm truncate uppercase tracking-tight'>{card.name}</p>
                  <p className='text-slate-500 text-xs truncate font-medium'>{card.cuisine} · {card.price}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <Star size={11} className='text-amber-400 fill-amber-400' />
                    <span className='text-slate-700 text-xs font-bold'>{card.rating}</span>
                    <span className='text-xs text-emerald-600 font-black px-1.5 py-0.5 bg-emerald-50 rounded'>H:{card.hygiene}</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
              </motion.div>
            ))}
          </div>

          {/* Stat pills row — centered */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible"
            className='flex flex-wrap justify-center gap-3 mt-8'>
            {[
              { label: '2,400+ Messes Listed', icon: '🏪' },
              { label: '18K+ Student Reviews', icon: '⭐' },
              { label: 'FSSAI Verified Data', icon: '🛡️' },
            ].map(({ label, icon }) => (
              <span key={label} className='flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 text-white text-xs px-3 py-1.5 rounded-full font-medium'>
                <span>{icon}</span>{label}
              </span>
            ))}
          </motion.div>
        </div>

      </div>

      {/* Scroll cue */}
      <motion.div animate={{ y: [0,8,0] }} transition={{ duration:2, repeat:Infinity }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40'>
        <ChevronRight size={24} className='rotate-90' />
      </motion.div>
    </section>
  );
}
