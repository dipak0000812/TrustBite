import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, ArrowLeft, Loader2, Building2, Clock,
  Phone, Tag, Image, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messService } from '../../services/messService';
import { Skeleton } from '../../components/Skeleton';

const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all bg-white";
const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2";
const cardClass = "bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 mb-5";

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
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-orange-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
);

const CUISINE_OPTIONS = [
  '', 'maharashtrian', 'south_indian', 'north_indian', 'gujarati', 'rajasthani', 'multi_cuisine'
];

const OwnerMessEdit = () => {
  const navigate = useNavigate();
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    let mounted = true;
    messService.getOwnerMesses().then(data => {
      if (mounted && data.length > 0) {
        const m = data[0];
        setMess(m);
        setForm({
          name: m.name || '',
          description: m.description || '',
          address: m.address || '',
          city: m.city || '',
          pincode: m.pincode || '',
          cuisine_type: m.cuisine_type || '',
          is_veg: m.is_veg ?? true,
          price_per_meal: m.price_per_meal ? String(m.price_per_meal) : '',
          weekly_price: m.weekly_price ? String(m.weekly_price) : '',
          monthly_price: m.monthly_price ? String(m.monthly_price) : '',
          serves_breakfast: m.serves_breakfast ?? true,
          serves_lunch: m.serves_lunch ?? true,
          serves_dinner: m.serves_dinner ?? true,
          breakfast_time: m.breakfast_time || '',
          lunch_time: m.lunch_time || '',
          dinner_time: m.dinner_time || '',
          owner_phone: m.owner_phone || '',
          fssai_license: m.fssai_license || '',
          tags: m.tags || '',
          image_url: m.image_url || '',
          gallery_images: m.gallery_images || '',
        });
      }
    }).catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!mess) return;
    if (!form.name?.trim()) { toast.error('Mess name is required'); return; }
    if (!form.price_per_meal || isNaN(Number(form.price_per_meal))) { toast.error('Valid price per meal required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price_per_meal: parseFloat(form.price_per_meal),
        weekly_price: form.weekly_price ? parseFloat(form.weekly_price) : null,
        monthly_price: form.monthly_price ? parseFloat(form.monthly_price) : null,
      };
      await messService.update(mess.id, payload);
      toast.success('Mess profile updated!');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-[28px] mb-5" />)}
        </div>
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="text-center p-12">
          <p className="text-slate-500 font-medium mb-4">No mess found. Complete onboarding first.</p>
          <button onClick={() => navigate('/owner/onboarding')} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-sm">
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Edit Mess Profile</h1>
            <p className="text-slate-500 text-sm font-medium">{mess.name}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>

          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" /> Basic Information
            </h3>
            <div className="space-y-4">
              <Field label="Mess Name *">
                <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea className={inputClass} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell students what makes your mess special..." />
              </Field>
              <Field label="Cuisine Type">
                <select className={inputClass} value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}>
                  {CUISINE_OPTIONS.map(c => (
                    <option key={c} value={c}>{c ? c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Select cuisine...'}</option>
                  ))}
                </select>
              </Field>
              <Toggle label="Vegetarian Only" checked={form.is_veg} onChange={v => set('is_veg', v)} />
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4">Location</h3>
            <div className="space-y-4">
              <Field label="Full Address">
                <input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} />
                </Field>
                <Field label="Pincode">
                  <input className={inputClass} value={form.pincode} onChange={e => set('pincode', e.target.value)} maxLength={10} />
                </Field>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4">Pricing</h3>
            <div className="space-y-4">
              <Field label="Price Per Meal (₹) *">
                <input type="number" min="0" className={inputClass} value={form.price_per_meal} onChange={e => set('price_per_meal', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weekly Plan (₹)">
                  <input type="number" min="0" className={inputClass} value={form.weekly_price} onChange={e => set('weekly_price', e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Monthly Plan (₹)">
                  <input type="number" min="0" className={inputClass} value={form.monthly_price} onChange={e => set('monthly_price', e.target.value)} placeholder="Optional" />
                </Field>
              </div>
            </div>
          </motion.div>

          {/* Timings */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Meal Timings
            </h3>
            <div className="space-y-3">
              <Toggle label="Serves Breakfast" checked={form.serves_breakfast} onChange={v => set('serves_breakfast', v)} />
              {form.serves_breakfast && (
                <Field label="Breakfast Time">
                  <input className={inputClass} value={form.breakfast_time} onChange={e => set('breakfast_time', e.target.value)} placeholder="7:30 AM - 10:00 AM" />
                </Field>
              )}
              <Toggle label="Serves Lunch" checked={form.serves_lunch} onChange={v => set('serves_lunch', v)} />
              {form.serves_lunch && (
                <Field label="Lunch Time">
                  <input className={inputClass} value={form.lunch_time} onChange={e => set('lunch_time', e.target.value)} placeholder="12:30 PM - 3:00 PM" />
                </Field>
              )}
              <Toggle label="Serves Dinner" checked={form.serves_dinner} onChange={v => set('serves_dinner', v)} />
              {form.serves_dinner && (
                <Field label="Dinner Time">
                  <input className={inputClass} value={form.dinner_time} onChange={e => set('dinner_time', e.target.value)} placeholder="7:30 PM - 10:30 PM" />
                </Field>
              )}
            </div>
          </motion.div>

          {/* Contact & FSSAI */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" /> Contact & Verification
            </h3>
            <div className="space-y-4">
              <Field label="Contact Phone">
                <input className={inputClass} value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} placeholder="9876543210" />
              </Field>
              <Field label="FSSAI License Number">
                <input className={inputClass} value={form.fssai_license} onChange={e => set('fssai_license', e.target.value)} placeholder="10019022001234" />
              </Field>
            </div>
          </motion.div>

          {/* Tags & Gallery */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cardClass}>
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-orange-500" /> Gallery & Tags
            </h3>
            <div className="space-y-4">
              <Field label="Cover Image URL">
                <input className={inputClass} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
              </Field>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-slate-200" onError={e => { e.target.style.display = 'none'; }} />
              )}
              <Field label="Gallery Images (comma-separated URLs)">
                <textarea className={inputClass} rows={3} value={form.gallery_images} onChange={e => set('gallery_images', e.target.value)} placeholder="https://img1.jpg, https://img2.jpg" />
              </Field>
              <Field label="Tags (comma-separated)">
                <input className={inputClass} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Budget, Students, Tiffin" />
              </Field>
            </div>
          </motion.div>

          {/* Save */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/owner/dashboard')}
              className="px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerMessEdit;
