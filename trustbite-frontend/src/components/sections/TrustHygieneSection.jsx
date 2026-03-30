import { motion } from 'framer-motion';
import { ShieldCheck, Award, Eye, ClipboardCheck } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/motion';

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified Hygiene', desc: 'Every listed mess undergoes a strict 40-point hygiene audit.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Award, title: 'Trust Scoring', desc: 'Our proprietary algorithm weights data from 5 different sources.', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Eye, title: 'Visual Proof', desc: 'Recent kitchen photos verified by our volunteer student network.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: ClipboardCheck, title: 'FSSAI Status', desc: 'Real-time license verification with national safety databases.', color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function TrustHygieneSection() {
  return (
    <section className='py-24 bg-white overflow-hidden'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <motion.div variants={staggerContainer} initial='hidden' whileInView='visible' viewport={{ once:true, margin:'-80px' }}>
          
          <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
            <motion.div variants={fadeInUp}>
              <span className='text-brand-accent font-bold text-sm tracking-widest uppercase'>Safety First</span>
              <h2 className='font-display font-bold text-slate-900 mt-2 text-4xl lg:text-5xl leading-tight'>
                We Don&apos;t Just List Food.<br />We Build Trust.
              </h2>
            </motion.div>
            <motion.p variants={fadeInUp} className='text-slate-500 text-lg leading-relaxed'>
              TrustBite was founded on a single premise: students deserve to know exactly what goes into their meals. We combine community data with professional audits to create the most transparent discovery engine in the country.
            </motion.p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeInUp} 
                className='p-8 rounded-[32px] border border-slate-100 hover:border-brand-accent/20 transition-all hover:shadow-xl hover:shadow-slate-200/50 group bg-white'
              >
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className='font-display font-bold text-slate-900 text-xl mb-3'>{f.title}</h3>
                <p className='text-slate-500 text-sm leading-relaxed'>{f.desc}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
