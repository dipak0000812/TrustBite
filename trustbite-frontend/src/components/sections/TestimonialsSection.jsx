const TESTIMONIALS = [
  { name:'Aryan Mehta', college:'MIT Pune', rating:5, text:'TrustBite completely changed how I find food near my hostel. The hygiene scores are the real deal — I check them before every new mess.' },
  { name:'Priya Nair', college:'Symbiosis, Pune', rating:5, text:'Finally an app that shows me actual hygiene data and not just star ratings. Found my go-to mess in 5 minutes. Absolutely love it!' },
  { name:'Rohit Sharma', college:'VIT Pune', rating:4, text:'The AI suggestions are surprisingly accurate. It knew I wanted cheap South Indian and nailed it with 3 perfect suggestions.' },
  { name:'Sneha Kulkarni', college:'COEP Pune', rating:5, text:'As a girl who moves between PGs, TrustBite is my safety net for food. Verified badges and hygiene scores give me real confidence.' },
  { name:'Kiran Patil', college:'Fergusson Pune', rating:5, text:'Discovered 4 amazing messes within 1km of my college. The compare feature is brilliant — saved me so much time.' },
  { name:'Divya Iyer', college:'SCOE Pune', rating:4, text:'Clean UI, accurate data, no spam. This is exactly what students needed. The trust score is a game-changer.' },
];

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../lib/motion';

export default function TestimonialsSection() {
  return (
    <section className='py-24' style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)' }}>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <motion.div variants={staggerContainer} initial='hidden' whileInView='visible' viewport={{ once:true, margin:'-80px' }}>
          <motion.div variants={fadeInUp} className='text-center mb-14'>
            <span className='text-orange-500 font-semibold text-sm tracking-widest uppercase'>Students Love It</span>
            <h2 className='font-display font-bold text-slate-900 mt-2' style={{ fontSize: 'clamp(1.875rem, 3vw, 3rem)' }}>
              Real Reviews from Real Students
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {TESTIMONIALS.map(({ name, college, rating, text }) => (
              <motion.div key={name} variants={fadeInUp}
                whileHover={{ y:-4, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', transition:{ duration:0.2 } }}
                className='bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-card'
              >
                <div className='text-5xl font-serif text-orange-200 leading-none select-none'>&ldquo;</div>
                <p className='text-slate-600 text-sm leading-relaxed flex-1 -mt-4'>{text}</p>
                <div className='flex items-center gap-1 mt-auto'>
                  {Array.from({ length: 5 }).map((_,i) => (
                    <Star key={i} size={14} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center text-white font-bold text-sm'>
                    {name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className='font-semibold text-slate-900 text-sm'>{name}</p>
                    <p className='text-slate-400 text-xs'>{college}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
