import { motion } from 'framer-motion';
import { Search, MapPin, Star, Shield, ChevronRight, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fadeInUp, scaleIn } from '../../lib/motion';
import { messService } from '../../services/messService';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [floatingMesses, setFloatingMesses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    messService.getFeatured(3)
      .then(data => setFloatingMesses(data))
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/discover?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <section className='relative min-h-screen overflow-hidden'
      style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA6A0A 50%, #F59E0B 100%)' }}>

      {/* Decorative bg elements - Hidden on smaller screens to prevent clutter */}
      <div className="absolute left-0 top-1/4 w-48 opacity-20 pointer-events-none hidden xl:block">
        <div className="text-8xl">🥗</div>
      </div>
      <div className="absolute right-0 top-1/3 w-48 opacity-20 pointer-events-none hidden xl:block">
        <div className="text-8xl">🍱</div>
      </div>
      
      {/* Subtle radial light in center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.15), transparent)' }}
      />

      <div className='relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20 min-h-screen flex flex-col items-center justify-center text-center gap-6 sm:gap-8'>

        {/* Text + Search */}
        <div className='flex flex-col items-center gap-4 sm:gap-6 w-full'>

          {/* Trust badge pill — centered */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible"
            className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 w-fit mx-auto'>
            <Shield size={12} className='text-white sm:w-[14px]' />
            <span className='text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase'>India&apos;s First Mess Trust Platform</span>
          </motion.div>

          {/* Headline — centered */}
          <motion.h1 variants={fadeInUp} initial="hidden" animate="visible"
            className='font-display font-black text-white leading-[1.1] sm:leading-tight'
            style={{ fontSize: 'clamp(2.25rem, 8vw, 4.5rem)' }}>
            Find Messes You Can <br className="hidden sm:block" />
            <span className="relative inline-block mt-2 sm:mt-0">
              Actually Trust
              <span className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-1.5 bg-white/40 rounded-full" />
            </span>
          </motion.h1>

          {/* Subheadline — centered, max-w-lg */}
          <motion.p variants={fadeInUp} initial="hidden" animate="visible"
            className='text-white/80 text-base sm:text-lg max-w-lg leading-relaxed px-4'>
            Discover nearby mess services with verified hygiene scores,
            real student reviews, and AI-powered recommendations.
          </motion.p>

          {/* Search Bar — centered, max-w-2xl */}
          <motion.form variants={scaleIn} initial="hidden" animate="visible"
            onSubmit={handleSearch}
            className='relative mt-4 sm:mt-2 w-full max-w-2xl mx-auto px-2 sm:px-0'>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[24px] sm:rounded-2xl shadow-2xl shadow-black/20 overflow-hidden p-2 sm:p-0'>
              <div className='flex items-center gap-2 px-4 py-3 sm:py-4 text-slate-400 border-b sm:border-b-0 sm:border-r border-slate-100'>
                <MapPin size={18} className='text-orange-500' />
                <span className='text-sm text-slate-500 whitespace-nowrap font-bold'>{JSON.parse(localStorage.getItem('trustbite_user_prefs') || '{}').city || 'Pune'}</span>
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search area or cuisine...'
                className='flex-1 px-4 py-4 sm:py-4 text-slate-800 placeholder-slate-400 text-sm bg-transparent outline-none font-bold'
              />
              <button type="submit" className='bg-gray-900 text-white px-8 py-4 sm:py-3 sm:m-2 rounded-xl sm:rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 whitespace-nowrap'>
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </motion.form>

          {/* Floating Mess Cards row — centered below search */}
          {floatingMesses.length > 0 && (
            <div className="flex flex-row overflow-x-auto lg:overflow-x-visible gap-3 sm:gap-4 justify-start lg:justify-center mt-6 sm:mt-8 w-full max-w-4xl mx-auto px-6 sm:px-0 scrollbar-hide snap-x pb-4">
              {floatingMesses.map((mess, i) => (
                <Link key={mess.id} to={`/mess/${mess.id}`} className="flex-shrink-0 w-[260px] sm:w-[280px] lg:flex-1 snap-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: [0, -6, 0] }}
                    transition={{
                      opacity: { delay: 0.5 + i * 0.15, duration: 0.5 },
                      y: { delay: 1.2, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className="h-full bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl shadow-orange-900/20 cursor-pointer hover:scale-105 transition-transform duration-200 text-left relative group border border-white/50"
                  >
                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0'>
                      <span className='text-orange-500 font-bold text-lg'>{mess.is_veg ? '🥗' : '🍛'}</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-slate-900 font-black text-sm truncate uppercase tracking-tight'>{mess.name}</p>
                      <p className='text-slate-500 text-[10px] sm:text-xs truncate font-bold'>{mess.cuisine_type || 'General'} · ₹{Number(mess.price_per_meal || 0).toFixed(0)}</p>
                      <div className='flex items-center gap-2 mt-1'>
                        <Star size={10} className='text-amber-400 fill-amber-400' />
                        <span className='text-slate-700 text-[10px] sm:text-xs font-black'>{Number(mess.avg_rating || 0).toFixed(1)}</span>
                        {mess.hygiene_score && (
                          <span className='text-[10px] text-emerald-600 font-black px-1.5 py-0.5 bg-emerald-50 rounded'>H:{Number(mess.hygiene_score).toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors hidden sm:block" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Stat pills row — centered */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible"
            className='flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-4'>
            {[
              { label: '2,400+ Messes', icon: '🏪' },
              { label: '18K+ Reviews', icon: '⭐' },
              { label: 'FSSAI Verified', icon: '🛡️' },
            ].map(({ label, icon }) => (
              <span key={label} className='flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 text-white text-[10px] sm:text-xs px-3 sm:px-4 py-2 rounded-full font-bold uppercase tracking-wider'>
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
