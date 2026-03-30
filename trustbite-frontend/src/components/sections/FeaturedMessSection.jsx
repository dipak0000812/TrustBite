import { motion } from 'framer-motion';
import { useState } from 'react';
import { staggerContainer, fadeInUp } from '../../lib/motion';
import MessCard from '../cards/MessCard';
import { MOCK_MESSES } from '../../lib/constants';

const FILTERS = ['All', 'Top Rated', 'Near Me', 'Budget', 'Verified', 'Open Now'];

export default function FeaturedMessSection() {
  const [active, setActive] = useState('All');

  return (
    <section className='py-24 bg-slate-50'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>

        {/* Header */}
        <motion.div variants={staggerContainer} initial='hidden' whileInView='visible' viewport={{ once:true, margin:'-80px' }}>
          <motion.div variants={fadeInUp} className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10'>
            <div>
              <span className='text-orange-500 font-semibold text-sm tracking-widest uppercase'>Top Picks</span>
              <h2 className='font-display font-bold text-slate-900 mt-1' style={{ fontSize: 'clamp(1.875rem, 3vw, 3rem)' }}>
                Featured Messes Near You
              </h2>
            </div>
            <a href='/discover' className='text-orange-500 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all'>
              View All Messes →
            </a>
          </motion.div>

          {/* Filter chips */}
          <motion.div variants={fadeInUp} className='flex flex-wrap gap-2 mb-8'>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActive(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${ active===f ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-500' }`}
              >{f}</button>
            ))}
          </motion.div>

          {/* Card grid */}
          <motion.div variants={staggerContainer} className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {MOCK_MESSES.map(mess => (
              <motion.div key={mess.id} variants={fadeInUp}>
                <MessCard mess={mess} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
