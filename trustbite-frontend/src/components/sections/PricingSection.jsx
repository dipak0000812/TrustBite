import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const studentFeatures = [
  'Unlimited mess discovery',
  'Full hygiene scores & reports',
  'AI-powered meal recommendations',
  'Student review access',
  'Price comparison across messes',
  'Save favorite messes',
];

const ownerPlans = [
  {
    plan: 'Basic',
    price: '₹0',
    period: '/month',
    target: 'New mess owners',
    badge: null,
    style: 'bg-white border-slate-200',
    textStyle: 'text-[#111827]',
    priceColor: 'text-[#111827]',
    features: ['Basic listing', '1 photo upload', 'Standard search visibility', 'Student inquiries'],
    cta: 'List Your Mess Free',
    ctaStyle: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
    featured: false,
  },
  {
    plan: 'Verified',
    price: '₹499',
    period: '/month',
    yearlyPrice: '₹4,999/year — save 17%',
    target: 'Growing mess businesses',
    badge: 'Most Popular',
    style: 'border-orange-400',
    textStyle: 'text-white',
    priceColor: 'text-white',
    features: ['Verified badge ✓', 'Priority in search results', 'Up to 10 photos', 'Analytics dashboard', 'Respond to reviews', 'FSSAI badge display'],
    cta: 'Start 14-Day Free Trial',
    ctaStyle: 'bg-white text-orange-600 hover:bg-white/90',
    featured: true,
  },
  {
    plan: 'Premium',
    price: '₹999',
    period: '/month',
    target: 'Established mess chains',
    badge: null,
    style: 'border-slate-700',
    textStyle: 'text-white',
    priceColor: 'text-white',
    features: ['Everything in Verified', 'AI business insights', 'Featured placement', 'Dedicated account manager', 'Bulk menu import', 'Priority support'],
    cta: 'Contact Sales →',
    ctaStyle: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
    featured: false,
  },
];

export default function PricingSection() {
  const [tab, setTab] = useState('students');

  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-orange-100 mb-6">
            ✦ Simple Pricing
          </span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#111827] mb-4 leading-tight">
            Free for Students. <span className="text-orange-500">Always.</span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-lg mx-auto">
            We charge mess owners, not hungry students. Pick a plan below if you're a mess owner looking to grow.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-14">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setTab('students')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                tab === 'students' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🎓 Students
            </button>
            <button
              onClick={() => setTab('owners')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                tab === 'owners' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🍽️ Mess Owners
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'students' ? (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <div
                className="max-w-lg w-full rounded-[24px] p-10 lg:p-12 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #F97316 0%, #FB923C 100%)', boxShadow: '0 16px 48px rgba(249,115,22,0.3)' }}
              >
                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
                />

                <div className="relative z-10">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/25">
                    Free Forever
                  </span>
                  <div className="mb-2">
                    <span className="font-mono font-black text-6xl lg:text-7xl text-white">₹0</span>
                    <span className="text-white/70 text-lg font-medium ml-1">/ forever</span>
                  </div>
                  <p className="text-white/80 text-base mb-10">
                    Because students deserve safe food, not another subscription.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-10">
                    {studentFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-white flex-shrink-0" />
                        <span className="text-white/90 text-sm font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl text-base hover:bg-white/95 hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Start Exploring Free <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="owners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"
            >
              {ownerPlans.map((plan, i) => (
                <motion.div
                  key={plan.plan}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={plan.featured ? 'md:scale-[1.04] relative z-10' : ''}
                >
                  <div
                    className={`rounded-[20px] p-7 lg:p-8 h-full flex flex-col border-2 ${plan.style} relative overflow-hidden transition-all duration-300 hover:-translate-y-1`}
                    style={{
                      background: plan.featured
                        ? 'linear-gradient(145deg, #F97316 0%, #EA580C 100%)'
                        : plan.plan === 'Premium'
                        ? '#0F172A'
                        : 'white',
                      boxShadow: plan.featured ? '0 12px 40px rgba(249,115,22,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <span className="absolute top-4 right-4 bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}

                    <h3 className={`font-display font-bold text-lg mb-1 ${plan.textStyle}`}>{plan.plan}</h3>
                    <p className={`text-xs mb-5 ${plan.featured ? 'text-white/60' : plan.plan === 'Premium' ? 'text-slate-400' : 'text-[#6B7280]'}`}>{plan.target}</p>

                    <div className="mb-6">
                      <span className={`font-mono font-black text-4xl ${plan.priceColor}`}>{plan.price}</span>
                      <span className={`text-sm ${plan.featured ? 'text-white/60' : plan.plan === 'Premium' ? 'text-slate-400' : 'text-[#6B7280]'}`}>{plan.period}</span>
                      {plan.yearlyPrice && (
                        <p className="text-xs text-white/50 mt-1">{plan.yearlyPrice}</p>
                      )}
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2.5">
                          <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-white' : plan.plan === 'Premium' ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={`text-sm ${plan.featured ? 'text-white/85' : plan.plan === 'Premium' ? 'text-slate-300' : 'text-[#374151]'}`}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${plan.ctaStyle}`}>
                      {plan.cta}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
