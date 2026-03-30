import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, ThumbsUp } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/motion';

const STEPS = [
  { n: '01', icon: MapPin, title: 'Search Your Area', desc: 'Enter your college or hostel location to discover all nearby mess services instantly.' },
  { n: '02', icon: ShieldCheck, title: 'Compare Trust Scores', desc: 'View real hygiene ratings, FSSAI data, and verified student reviews side-by-side.' },
  { n: '03', icon: ThumbsUp, title: 'Choose with Confidence', desc: 'Pick the mess that matches your budget, taste, and hygiene standards. No surprises.' },
];

export default function HowItWorksSection() {
  return (
    <section className='py-24' style={{ background: 'linear-gradient(135deg, #0F2050 0%, #1A3A6B 100%)' }}>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <motion.div variants={staggerContainer} initial='hidden' whileInView='visible' viewport={{ once: true, margin: '-80px' }}>

          <motion.div variants={fadeInUp} className='text-center mb-16'>
            <span className='text-orange-400 font-semibold text-sm tracking-widest uppercase'>Simple Process</span>
            <h2 className='font-display font-bold text-white mt-2' style={{ fontSize: 'clamp(1.875rem, 3vw, 3rem)' }}>
              How TrustBite Works
            </h2>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-8 relative'>
            {/* connector line */}
            <div className='hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />

            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <motion.div key={n} variants={fadeInUp}
                className='flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 backdrop-blur-sm'
                style={{ background: 'rgba(255,255,255,0.06)' }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(249,115,22,0.4)', transition: { duration: 0.2 } }}
              >
                <div className='relative mb-6'>
                  <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto'
                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.1))', border: '1px solid rgba(249,115,22,0.3)' }}>
                    <Icon size={32} className='text-orange-400' />
                  </div>
                  <span className='absolute -top-2 -right-2 font-mono font-black text-orange-500/30 text-5xl leading-none select-none'>{n}</span>
                </div>
                <h3 className='font-display font-bold text-white text-xl mb-3'>{title}</h3>
                <p className='text-white/55 text-sm leading-relaxed'>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
