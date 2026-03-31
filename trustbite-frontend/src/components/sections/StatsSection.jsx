import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function CountUp({ end, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const num = typeof end === 'string' ? parseInt(end.replace(/,/g, '')) : end;
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { start = num; clearInterval(timer); }
      setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  const formatted = count >= 1000 ? (count / 1000).toFixed(count % 1000 === 0 ? 0 : 0) + '' : count.toString();
  // Show comma-formatted if big
  const display = count.toLocaleString();

  return <span ref={ref}>{display}{suffix}</span>;
}

const stats = [
  { value: 18000, suffix: '+', label: 'Active Students' },
  { value: 2400, suffix: '+', label: 'Verified Messes' },
  { value: 24, suffix: '', label: 'Cities Covered' },
  { value: 98, suffix: '%', label: 'Student Satisfaction' },
];

export default function StatsSection() {
  return (
    <section className="relative py-24 lg:py-28 overflow-hidden" style={{ background: '#0F172A' }}>
      {/* Dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Orange radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 font-bold text-xs tracking-[0.25em] uppercase mb-4 block">By the Numbers</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight">
            TrustBite by the{' '}
            <span className="relative inline-block">
              Numbers
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
            </span>
          </h2>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`text-center py-4 ${i < stats.length - 1 ? 'md:border-r md:border-white/10' : ''}`}
            >
              <div className="font-mono font-black text-5xl lg:text-7xl text-white mb-3 tracking-tight">
                <CountUp end={stat.value} suffix="" duration={1500} />
                <span className="text-orange-500">{stat.suffix}</span>
              </div>
              <p className="text-slate-400 text-xs lg:text-sm font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
