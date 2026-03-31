import { motion } from 'framer-motion';
import { MapPin, Search, ShieldCheck, Utensils, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    num: '01',
    icon: <><Search className="w-6 h-6" /><MapPin className="w-4 h-4 -ml-2 -mt-1" /></>,
    title: 'Search Your Area',
    desc: 'Type your hostel, college area or allow location access. We find every mess within walking distance.',
    tag: 'Discovery',
  },
  {
    num: '02',
    icon: <><ShieldCheck className="w-7 h-7" /></>,
    title: 'Check Trust Score',
    desc: 'See hygiene ratings, verified student reviews, FSSAI status and inspection history — all in one place.',
    tag: 'Verification',
  },
  {
    num: '03',
    icon: <><Utensils className="w-6 h-6" /><CheckCircle className="w-4 h-4 -ml-2 -mt-1" /></>,
    title: 'Eat with Confidence',
    desc: 'Walk in knowing exactly what you\'re getting. No guesswork, no regret — just safe, verified meals.',
    tag: 'Confidence',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-orange-100 mb-6">
            ✦ Simple as 1-2-3
          </span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#111827] mb-4 leading-tight">
            Trust Your Meal in <span className="text-orange-500">3 Steps</span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-lg mx-auto leading-relaxed">
            No guesswork. No regret. Just verified meals near you.
          </p>
        </motion.div>

        {/* Steps with connector */}
        <div className="relative">
          {/* Dashed connector line — desktop only */}
          <svg className="absolute top-24 left-0 w-full h-12 hidden lg:block pointer-events-none" viewBox="0 0 1200 50" fill="none" preserveAspectRatio="none">
            <path
              d="M 150 25 C 350 -15, 450 65, 600 25 C 750 -15, 850 65, 1050 25"
              stroke="#FB923C"
              strokeWidth="2"
              strokeDasharray="8 6"
              strokeOpacity="0.35"
              fill="none"
            />
            {/* Arrow heads */}
            <polygon points="590,22 600,18 600,28" fill="#FB923C" fillOpacity="0.4" />
            <polygon points="1040,22 1050,18 1050,28" fill="#FB923C" fillOpacity="0.4" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative"
              >
                <div
                  className="relative bg-white rounded-2xl p-8 lg:p-10 border border-[#FEE2CB] hover:border-orange-400 transition-all duration-300 hover:-translate-y-1.5 cursor-default"
                  style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.08)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(249,115,22,0.08)'}
                >
                  {/* Watermark number */}
                  <span className="absolute top-4 right-6 font-mono font-black text-[80px] leading-none text-orange-500/[0.06] select-none pointer-events-none">
                    {step.num}
                  </span>

                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-xl text-[#111827] mb-3 relative z-10">{step.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-5 relative z-10">{step.desc}</p>

                  {/* Tag */}
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full relative z-10">
                    {step.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
