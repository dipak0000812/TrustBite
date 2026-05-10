import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import MessCard from '../MessCard';
import { MOCK_MESSES } from '../../lib/constants';
import { fadeInUp, staggerContainer } from '../../lib/motion';

export default function AIRecommendationSection() {
  const [pref, setPref] = useState('veg');
  const [key, setKey] = useState(0);
  const suggestions = MOCK_MESSES.slice(key % 2, (key % 2) + 3);

  return (
    <section className='py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-16 items-center'>

          {/* Left */}
          <motion.div variants={staggerContainer} initial='hidden' whileInView='visible' viewport={{ once:true, margin:'-80px' }}>
            <motion.div variants={fadeInUp} className='inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4'>
              <Sparkles size={12} />
              AI-Powered
            </motion.div>
            <motion.h2 variants={fadeInUp} className='font-display font-bold text-slate-900 mb-4' style={{ fontSize: 'clamp(1.875rem, 3vw, 2.5rem)' }}>
              Smart Suggestions<br />Built Just for You
            </motion.h2>
            <motion.p variants={fadeInUp} className='text-slate-500 leading-relaxed mb-8'>
              Tell us your preferences and our AI finds the best-matched messes — filtered by hygiene, budget, and cuisine you actually like.
            </motion.p>

            <motion.div variants={fadeInUp} className='flex flex-col gap-4'>
              <div>
                <p className='text-sm font-semibold text-slate-700 mb-2'>Food Preference</p>
                <div className='flex gap-2'>
                  {['veg','non-veg','both'].map(p => (
                    <button key={p} onClick={() => setPref(p)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${ pref===p ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-50' }`}
                    >{p}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setKey(k => k+1)}
                className='flex items-center gap-2 w-fit bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 hover:scale-105'>
                <RefreshCw size={16} />
                Refresh Suggestions
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Cards */}
          <div className='relative'>
             <AnimatePresence mode='wait'>
                <motion.div key={key} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
                  transition={{ duration:0.4 }} className='flex flex-col gap-4'>
                  {suggestions.map((mess, i) => (
                    <motion.div key={mess.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
                      <MessCard mess={mess} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
