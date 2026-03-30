import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/motion';

export default function CTASection() {
  return (
    <section className="py-12 px-4 lg:px-8 bg-slate-50">
      {/* Outer wrapper gives the soft page bg - #F8FAFC equivalent */}
      
      <motion.div 
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl py-20 px-8 text-center"
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA6A0A 40%, #F59E0B 100%)' }}
      >
        
        {/* Decorative elements */}
        {/* Radial light top center */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.18), transparent)' }}
        />
        {/* Subtle bottom dark fade for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.12), transparent)' }}
        />
        {/* Decorative food emoji - left */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-7xl opacity-15 pointer-events-none hidden lg:block">🛡️</div>
        {/* Decorative food emoji - right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-15 pointer-events-none hidden lg:block">🍱</div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
          
          {/* Pill badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-xs tracking-widest px-4 py-2 rounded-full uppercase">
            ✦ Join the Revolution
          </motion.div>

          {/* Headline */}
          <motion.h2 variants={fadeInUp} className="font-display font-extrabold text-white text-4xl lg:text-5xl leading-tight">
            Ready to Eat with <br /> Complete Confidence?
          </motion.h2>

          {/* Subheadline */}
          <motion.p variants={fadeInUp} className="text-white/80 text-lg max-w-xl mx-auto text-center leading-relaxed">
            TrustBite is more than just a listing app — it&apos;s a standard for student dining. Join 18,000+ students and get access to the safest meals in your city.
          </motion.p>

          {/* Button row */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link 
              to='/discover' 
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Shield size={20} />
              Find Your Mess
              <ArrowRight size={18} className="ml-1" />
            </Link>
            
            <Link 
              to='/register' 
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/25 hover:border-white/60 transition-all duration-200"
            >
              Create Account
            </Link>
          </motion.div>

          {/* Avatar + social proof */}
          <motion.div variants={fadeInUp} className="flex items-center gap-3 mt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-orange-400 bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs">
                  {i === 4 ? '18K+' : ''}
                </div>
              ))}
            </div>
            <span className="text-white/85 text-sm font-medium">Trusted by students across 24+ universities</span>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
