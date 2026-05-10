import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Eye, MessageSquare, ShieldCheck, Clock,
  Edit3, UtensilsCrossed, ArrowRight, Loader2,
  TrendingUp, CheckCircle2, AlertCircle, Phone, MapPin
} from 'lucide-react';
import useStore from '../../store/useStore';
import { messService } from '../../services/messService';
import { Skeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"
  >
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value ?? '--'}</div>
    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </motion.div>
);

const OwnerDashboard = () => {
  const { user } = useStore();
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMess, setActiveMess] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await messService.getOwnerMesses();
        if (mounted) {
          setMesses(data);
          if (data.length > 0) setActiveMess(data[0]);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load mess data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-80 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
          </div>
          <Skeleton className="h-96 rounded-[32px]" />
        </div>
      </div>
    );
  }

  // No mess yet — prompt to create
  if (messes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full mx-4 text-center"
        >
          <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-xl">
            <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              You haven't registered your mess yet. Complete your mess profile to start receiving students.
            </p>
            <Link
              to="/owner/onboarding"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-orange-600 transition-colors hover:shadow-lg hover:shadow-orange-500/25"
            >
              Register My Mess <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const mess = activeMess || messes[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">Owner Dashboard</h1>
              <p className="text-slate-500 font-medium">Managing <span className="font-bold text-orange-500">{mess.name}</span></p>
            </div>
            <div className="flex items-center gap-3">
              {mess.is_fssai_verified ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> FSSAI Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> Verification Pending
                </span>
              )}
              <Link
                to="/owner/onboarding"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Mess
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Star} label="Avg Rating" value={Number(mess.avg_rating || 0).toFixed(1)} color="text-amber-500" bg="bg-amber-50" />
          <StatCard icon={MessageSquare} label="Total Reviews" value={mess.total_reviews || 0} color="text-blue-500" bg="bg-blue-50" />
          <StatCard icon={TrendingUp} label="Trust Score" value={mess.trust_score ? Number(mess.trust_score).toFixed(1) : '--'} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard icon={ShieldCheck} label="Hygiene Score" value={mess.hygiene_score ? Number(mess.hygiene_score).toFixed(1) : '--'} color="text-purple-500" bg="bg-purple-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Mess Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mess Profile Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {/* Cover */}
              <div className="h-40 bg-gradient-to-br from-orange-400 to-amber-300 flex items-center justify-center relative">
                <span className="text-6xl opacity-50">{mess.is_veg ? '🥗' : '🍛'}</span>
                <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700">
                  {mess.is_veg ? 'VEG' : 'NON-VEG'} · {mess.cuisine_type || 'General'}
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-black text-slate-900 mb-1">{mess.name}</h2>
                <p className="text-slate-500 text-sm mb-4 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />{mess.address}, {mess.city}
                </p>
                {mess.description && (
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{mess.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-2xl p-3">
                    <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Price / Meal</div>
                    <div className="font-black text-slate-900">₹{Number(mess.price_per_meal || 0).toFixed(0)}</div>
                  </div>
                  {mess.monthly_price && (
                    <div className="bg-slate-50 rounded-2xl p-3">
                      <div className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">Monthly Plan</div>
                      <div className="font-black text-slate-900">₹{Number(mess.monthly_price).toFixed(0)}</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Meal Timings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Meal Timings
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Breakfast', serves: mess.serves_breakfast, time: mess.breakfast_time },
                  { label: 'Lunch', serves: mess.serves_lunch, time: mess.lunch_time },
                  { label: 'Dinner', serves: mess.serves_dinner, time: mess.dinner_time },
                ].map(({ label, serves, time }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 font-medium text-sm">{label}</span>
                    <span className={`text-sm font-bold ${serves ? 'text-slate-900' : 'text-slate-300'}`}>
                      {serves ? (time || 'Available') : 'Not Served'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tags */}
            {mess.tags && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {mess.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
              <h3 className="text-base font-bold mb-5">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Edit Mess Profile', to: '/owner/edit', icon: Edit3 },
                  { label: 'Manage Menu', to: '/owner/menu', icon: UtensilsCrossed },
                  { label: 'View Reviews', to: `/mess/${mess.id}`, icon: MessageSquare },
                ].map(({ label, to, icon: Icon }) => (
                  <Link key={label} to={to} className="flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white py-2 transition-colors hover:translate-x-1 transform duration-150">
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Contact Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 font-medium">{mess.owner_phone || user?.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 font-medium">{mess.city}, {mess.pincode}</span>
                </div>
              </div>
            </motion.div>

            {/* Verification Status */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Verification</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">FSSAI License</span>
                  {mess.is_fssai_verified
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <AlertCircle className="w-5 h-5 text-amber-500" />}
                </div>
                {mess.fssai_license && (
                  <p className="text-xs text-slate-400 font-mono">{mess.fssai_license}</p>
                )}
              </div>
            </motion.div>

            {/* Public Profile Link */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Link
                to={`/mess/${mess.id}`}
                className="flex items-center justify-center gap-2 w-full bg-orange-50 text-orange-600 font-bold py-4 rounded-2xl hover:bg-orange-100 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" /> View Public Profile
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
