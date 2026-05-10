import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, Clock, Shield, Image,
  ArrowRight, ArrowLeft, CheckCircle2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';
import { messService } from '../../services/messService';

// ─── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Owner Identity',  icon: User,      desc: 'Your personal information' },
  { id: 2, title: 'Mess Details',    icon: Building2,  desc: 'About your mess' },
  { id: 3, title: 'Operations',      icon: Clock,      desc: 'Timings & pricing' },
  { id: 4, title: 'Trust & Hygiene', icon: Shield,     desc: 'FSSAI & safety info' },
  { id: 5, title: 'Gallery',         icon: Image,      desc: 'Photos & cover image' },
];

const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white";
const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2";
const sectionClass = "bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 mb-4";

// ─── Field components ────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div>
      <p className="text-sm font-bold text-slate-800">{label}</p>
      {desc && <p className="text-xs text-slate-400">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-orange-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const OwnerOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 2: Mess Details
    name: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    cuisine_type: '',
    is_veg: true,
    // Step 3: Operations
    serves_breakfast: true,
    serves_lunch: true,
    serves_dinner: true,
    breakfast_time: '7:30 AM - 10:00 AM',
    lunch_time: '12:30 PM - 3:00 PM',
    dinner_time: '7:30 PM - 10:30 PM',
    price_per_meal: '',
    weekly_price: '',
    monthly_price: '',
    // Step 4: Trust
    fssai_license: '',
    is_fssai_verified: false,
    owner_phone: '',
    // Step 5: Gallery
    image_url: '',
    gallery_images: '',
    tags: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (step === 2) {
      if (!form.name.trim()) { toast.error('Mess name is required'); return false; }
      if (!form.address.trim()) { toast.error('Address is required'); return false; }
      if (!form.city.trim()) { toast.error('City is required'); return false; }
      if (!form.pincode.trim()) { toast.error('Pincode is required'); return false; }
    }
    if (step === 3) {
      if (!form.price_per_meal || isNaN(Number(form.price_per_meal))) {
        toast.error('Valid price per meal is required');
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 5)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price_per_meal: parseFloat(form.price_per_meal) || 0,
        weekly_price: form.weekly_price ? parseFloat(form.weekly_price) : null,
        monthly_price: form.monthly_price ? parseFloat(form.monthly_price) : null,
      };
      await messService.create(payload);
      localStorage.setItem('trustbite_owner_onboarding_complete', 'true');
      toast.success('Mess registered successfully! 🎉');
      navigate('/owner/dashboard');
    } catch (e) {
      toast.error(e?.message || 'Failed to create mess. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const { user } = useStore();
  React.useEffect(() => {
    if (user && user.role !== 'mess_owner') {
      navigate(user.role === 'student' ? '/student/dashboard' : '/');
    }
  }, [user, navigate]);

  // ─── Step Content Renderers ──────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <div className={sectionClass}>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your account has been created. Your name and contact from registration are already saved.
          This wizard will set up your mess profile so students can find you.
        </p>
      </div>
      <div className={sectionClass}>
        <div className="space-y-4">
          <Field label="Contact Phone (for students to reach you)">
            <input
              className={inputClass}
              placeholder="9876543210"
              value={form.owner_phone}
              onChange={e => set('owner_phone', e.target.value)}
              maxLength={15}
            />
          </Field>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className={sectionClass}>
        <div className="space-y-4">
          <Field label="Mess Name *">
            <input className={inputClass} placeholder="e.g. Shree Sai Mess" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} rows={3} placeholder="Tell students what makes your mess special..." value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>
        </div>
      </div>
      <div className={sectionClass}>
        <div className="space-y-4">
          <Field label="Full Address *">
            <input className={inputClass} placeholder="Lane 4, Near Symbiosis Gate 2" value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City *">
              <input className={inputClass} placeholder="Pune" value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
            <Field label="Pincode *">
              <input className={inputClass} placeholder="411004" value={form.pincode} onChange={e => set('pincode', e.target.value)} maxLength={10} />
            </Field>
          </div>
          <Field label="Cuisine Type">
            <select className={inputClass} value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}>
              <option value="">Select cuisine...</option>
              {['maharashtrian','south_indian','north_indian','gujarati','rajasthani','multi_cuisine'].map(c => (
                <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <div className={sectionClass}>
        <Toggle label="Vegetarian Only" desc="Check if you serve only vegetarian food" checked={form.is_veg} onChange={v => set('is_veg', v)} />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Meal Availability</h4>
        <Toggle label="Breakfast" checked={form.serves_breakfast} onChange={v => set('serves_breakfast', v)} />
        <Toggle label="Lunch" checked={form.serves_lunch} onChange={v => set('serves_lunch', v)} />
        <Toggle label="Dinner" checked={form.serves_dinner} onChange={v => set('serves_dinner', v)} />
      </div>
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Timings</h4>
        <div className="space-y-3">
          {form.serves_breakfast && (
            <Field label="Breakfast Timing">
              <input className={inputClass} value={form.breakfast_time} onChange={e => set('breakfast_time', e.target.value)} placeholder="7:30 AM - 10:00 AM" />
            </Field>
          )}
          {form.serves_lunch && (
            <Field label="Lunch Timing">
              <input className={inputClass} value={form.lunch_time} onChange={e => set('lunch_time', e.target.value)} placeholder="12:30 PM - 3:00 PM" />
            </Field>
          )}
          {form.serves_dinner && (
            <Field label="Dinner Timing">
              <input className={inputClass} value={form.dinner_time} onChange={e => set('dinner_time', e.target.value)} placeholder="7:30 PM - 10:30 PM" />
            </Field>
          )}
        </div>
      </div>
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Pricing</h4>
        <div className="space-y-3">
          <Field label="Price Per Meal (₹) *">
            <input className={inputClass} type="number" min="0" placeholder="80" value={form.price_per_meal} onChange={e => set('price_per_meal', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weekly Plan (₹)">
              <input className={inputClass} type="number" min="0" placeholder="Optional" value={form.weekly_price} onChange={e => set('weekly_price', e.target.value)} />
            </Field>
            <Field label="Monthly Plan (₹)">
              <input className={inputClass} type="number" min="0" placeholder="Optional" value={form.monthly_price} onChange={e => set('monthly_price', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">FSSAI License</h4>
        <div className="space-y-3">
          <Field label="FSSAI License Number">
            <input className={inputClass} placeholder="e.g. 10019022001234" value={form.fssai_license} onChange={e => set('fssai_license', e.target.value)} />
          </Field>
          <Toggle label="FSSAI Verified" desc="Mark if license has been verified" checked={form.is_fssai_verified} onChange={v => set('is_fssai_verified', v)} />
        </div>
      </div>
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Tags</h4>
        <Field label="Comma-separated tags (helps discovery)">
          <input className={inputClass} placeholder="e.g. Budget, Students, Tiffin, Home Style" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </Field>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Cover Image</h4>
        <Field label="Cover Image URL">
          <input className={inputClass} placeholder="https://..." value={form.image_url} onChange={e => set('image_url', e.target.value)} />
        </Field>
        {form.image_url && (
          <img src={form.image_url} alt="Cover preview" className="mt-3 w-full h-40 object-cover rounded-2xl border border-slate-200" onError={e => { e.target.style.display = 'none'; }} />
        )}
      </div>
      <div className={sectionClass}>
        <h4 className="text-sm font-bold text-slate-700 mb-4">Gallery Images</h4>
        <Field label="Comma-separated image URLs (dining hall, kitchen, etc.)">
          <textarea
            className={inputClass}
            rows={4}
            placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg"
            value={form.gallery_images}
            onChange={e => set('gallery_images', e.target.value)}
          />
        </Field>
        <p className="text-xs text-slate-400 mt-2">
          💡 Use any image hosting (Imgur, Cloudinary, etc.) and paste the URLs here.
        </p>
      </div>
    </div>
  );

  const RENDERERS = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
            <span className="text-white font-bold text-sm font-mono">TB</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">Register Your Mess</h1>
          <p className="text-slate-500 font-medium">Step {step} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s.id <= step ? 'bg-orange-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {React.createElement(STEPS[step - 1].icon, { className: 'w-5 h-5 text-orange-500' })}
          <div>
            <p className="text-sm font-black text-slate-900">{STEPS[step - 1].title}</p>
            <p className="text-xs text-slate-400">{STEPS[step - 1].desc}</p>
          </div>
        </div>

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {RENDERERS[step]?.()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={prev}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Registering Mess...' : 'Register My Mess'}
            </button>
          )}
        </div>

        {/* Skip link for step 1 */}
        {step === 1 && (
          <p className="text-center mt-4">
            <button onClick={() => navigate('/owner/dashboard')} className="text-sm text-slate-400 hover:text-slate-600 font-medium">
              Skip for now → Go to Dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default OwnerOnboarding;
