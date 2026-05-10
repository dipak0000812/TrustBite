import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Utensils, IndianRupee, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    city: 'Pune',
    diet: 'Veg',
    budget: 'Medium',
    priority: 'Hygiene'
  });

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else finishOnboarding();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    localStorage.setItem('trustbite_user_prefs', JSON.stringify(prefs));
    localStorage.setItem('trustbite_student_onboarding_complete', 'true');
    toast.success('Preferences saved! Welcome to TrustBite.');
    navigate('/student/dashboard');
  };

  const { user } = useStore();
  React.useEffect(() => {
    if (user && user.role !== 'student') {
      navigate(user.role === 'mess_owner' ? '/owner/dashboard' : '/');
    }
  }, [user, navigate]);

  const variants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  const StepIndicator = () => (
    <div className="flex gap-2 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-orange-500' : 'w-4 bg-slate-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-8 sm:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <StepIndicator />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Where do you stay?</h2>
                <p className="text-slate-500 font-medium">We'll show you messes nearby.</p>
              </div>
              <div className="space-y-3">
                {['Pune', 'Mumbai', 'Nashik', 'Other'].map(city => (
                  <button 
                    key={city}
                    onClick={() => { setPrefs({...prefs, city}); nextStep(); }}
                    className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 ${prefs.city === city ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <Utensils className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">What's your diet?</h2>
                <p className="text-slate-500 font-medium">Help us filter your food options.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {['Veg Only', 'Non-Veg', 'Jain', 'Everything'].map(diet => (
                  <button 
                    key={diet}
                    onClick={() => { setPrefs({...prefs, diet}); nextStep(); }}
                    className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 ${prefs.diet === diet ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">What's your budget?</h2>
                <p className="text-slate-500 font-medium">Monthly mess spending range.</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'Low', label: 'Economy (Under ₹2,500)' },
                  { id: 'Medium', label: 'Balanced (₹2,500 - ₹4,000)' },
                  { id: 'High', label: 'Premium (Over ₹4,000)' }
                ].map(b => (
                  <button 
                    key={b.id}
                    onClick={() => { setPrefs({...prefs, budget: b.id}); nextStep(); }}
                    className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 ${prefs.budget === b.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">What matters most?</h2>
                <p className="text-slate-500 font-medium">We'll prioritize this in results.</p>
              </div>
              <div className="space-y-3">
                {['Hygiene & Cleanliness', 'Low Price', 'Taste & Quality', 'Variety'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setPrefs({...prefs, priority: p})}
                    className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 ${prefs.priority === p ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                onClick={finishOnboarding}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 mt-6"
              >
                Complete Setup <CheckCircle2 className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 1 && (
          <button 
            onClick={prevStep}
            className="mt-8 text-slate-400 font-bold text-sm flex items-center gap-1 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Go Back
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
