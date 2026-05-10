import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { messService } from '../../services/messService';
import MessCard from '../MessCard';

export default function FeaturedMessSection() {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const data = await messService.getFeatured(4);
        setMesses(data);
      } catch (error) {
        console.error('Failed to fetch featured messes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMesses();
  }, []);

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
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : messes.length > 0 ? (
            messes.map((mess, i) => (
              <motion.div
                key={mess.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
              >
                <div className="h-full">
                  <MessCard mess={mess} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-slate-500 font-medium">
              No featured messes available right now.
            </div>
          )}
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
