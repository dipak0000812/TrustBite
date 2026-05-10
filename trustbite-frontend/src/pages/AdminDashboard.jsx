import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, ClipboardList, TrendingUp,
  CheckCircle2, XCircle, AlertCircle, Loader2,
  UserX, UserCheck, Eye, Star, MessageSquare,
  Building2, BarChart3, Flag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Skeleton } from '../components/Skeleton';

// ── Shared components ────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm"
  >
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value ?? '--'}</div>
    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </motion.div>
);

const TABS = [
  { key: 'messes',  label: 'Mess Control',     icon: Building2 },
  { key: 'users',   label: 'User Management',   icon: Users },
  { key: 'reviews', label: 'Review Moderation', icon: Flag },
];

// ── Main Component ────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [messes,  setMesses]  = useState([]);
  const [users,   setUsers]   = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messes');
  const [actionLoading, setActionLoading] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, messData, userData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllMesses(),
        adminService.getAllUsers(),
      ]);
      setStats(statsData);
      setMesses(Array.isArray(messData) ? messData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setAction = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  // ── Mess Actions ─────────────────────────────────────────────────
  const handleApprove = async (mess) => {
    const newState = !mess.is_active;
    setAction(mess.id, true);
    try {
      await adminService.approveMess(mess.id, newState);
      setMesses(prev => prev.map(m => m.id === mess.id ? { ...m, is_active: newState } : m));
      toast.success(newState ? `${mess.name} activated` : `${mess.name} deactivated`);
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setAction(mess.id, false);
    }
  };

  const handleSetHygiene = async (mess, score) => {
    const parsed = parseFloat(score);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) { toast.error('Score must be 0–10'); return; }
    setAction(`h_${mess.id}`, true);
    try {
      const updated = await adminService.setHygieneScore(mess.id, { hygiene_score: parsed });
      setMesses(prev => prev.map(m => m.id === mess.id ? { ...m, ...updated } : m));
      toast.success(`Hygiene score set to ${parsed}`);
    } catch (e) {
      toast.error(e.message || 'Failed to set score');
    } finally {
      setAction(`h_${mess.id}`, false);
    }
  };

  // ── User Actions ─────────────────────────────────────────────────
  const handleToggleUser = async (user) => {
    setAction(user.id, true);
    try {
      if (user.is_active) {
        await adminService.deactivateUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: false } : u));
        toast.success(`${user.full_name} suspended`);
      } else {
        await adminService.reactivateUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: true } : u));
        toast.success(`${user.full_name} reactivated`);
      }
    } catch (e) {
      toast.error(e.message || 'Action failed');
    } finally {
      setAction(user.id, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
          </div>
          <Skeleton className="h-12 w-full rounded-2xl mb-6" />
          <Skeleton className="h-[500px] rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-1">Admin Control Center</h1>
          <p className="text-slate-500 font-medium">Moderate messes, manage users, and maintain platform integrity.</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Building2}    label="Active Messes"   value={stats.active_messes}   color="text-orange-500"  bg="bg-orange-50" />
            <StatCard icon={Users}        label="Total Users"     value={stats.total_users}      color="text-blue-500"    bg="bg-blue-50" />
            <StatCard icon={MessageSquare} label="Total Reviews"  value={stats.total_reviews}    color="text-emerald-500" bg="bg-emerald-50" />
            <StatCard icon={TrendingUp}   label="Avg Trust Score" value={stats.avg_trust_score}  color="text-purple-500"  bg="bg-purple-50" />
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Pending Messes', value: stats.pending_messes,  color: 'text-amber-600',   bg: 'bg-amber-50' },
              { label: 'Active Owners',  value: stats.total_owners,    color: 'text-orange-600',  bg: 'bg-orange-50' },
              { label: 'Students',       value: stats.total_students,  color: 'text-blue-600',    bg: 'bg-blue-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-bold text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ── MESS CONTROL ─────────────────────────────────────── */}
          {activeTab === 'messes' && (
            <motion.div key="messes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">All Messes ({messes.length})</h2>
                  <span className="text-xs text-slate-400 font-medium">Approve · Set hygiene scores</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {messes.map(m => (
                    <MessRow key={m.id} mess={m} onApprove={handleApprove}
                      onSetHygiene={handleSetHygiene} actionLoading={actionLoading} />
                  ))}
                  {messes.length === 0 && <EmptyState icon={Building2} msg="No messes registered yet" />}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── USER MANAGEMENT ──────────────────────────────────── */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">All Users ({users.length})</h2>
                  <span className="text-xs text-slate-400 font-medium">Suspend · Reactivate</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {users.map(u => (
                    <UserRow key={u.id} user={u} onToggle={handleToggleUser} actionLoading={actionLoading} />
                  ))}
                  {users.length === 0 && <EmptyState icon={Users} msg="No users found" />}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REVIEW MODERATION ────────────────────────────────── */}
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReviewModeration messes={messes} adminService={adminService} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Mess Row ─────────────────────────────────────────────────────
const MessRow = ({ mess, onApprove, onSetHygiene, actionLoading }) => {
  const [hygieneInput, setHygieneInput] = useState(
    mess.hygiene_score ? String(Number(mess.hygiene_score).toFixed(1)) : ''
  );

  return (
    <div className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-sm">{mess.name}</p>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              mess.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}>{mess.is_active ? 'Active' : 'Inactive'}</span>
            {mess.is_fssai_verified && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">FSSAI ✓</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{mess.city} · {mess.cuisine_type || 'General'}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{Number(mess.avg_rating || 0).toFixed(1)}</span>
            <span>Trust: <strong>{mess.trust_score ? Number(mess.trust_score).toFixed(1) : '--'}</strong></span>
            <span>{mess.total_reviews} reviews</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Hygiene input */}
          <div className="flex items-center gap-1">
            <input
              type="number" min="0" max="10" step="0.1"
              value={hygieneInput}
              onChange={e => setHygieneInput(e.target.value)}
              placeholder="H"
              className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded-lg font-medium focus:outline-none focus:border-orange-500 text-center"
            />
            <button
              onClick={() => onSetHygiene(mess, hygieneInput)}
              disabled={actionLoading[`h_${mess.id}`]}
              title="Set hygiene score"
              className="w-7 h-7 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
            >
              {actionLoading[`h_${mess.id}`]
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <CheckCircle2 className="w-3 h-3" />}
            </button>
          </div>

          {/* View public page */}
          <Link to={`/mess/${mess.id}`} target="_blank"
            className="w-8 h-8 bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-500 rounded-xl flex items-center justify-center transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </Link>

          {/* Activate/Deactivate */}
          <button
            onClick={() => onApprove(mess)}
            disabled={actionLoading[mess.id]}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 ${
              mess.is_active
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {actionLoading[mess.id]
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : mess.is_active ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {mess.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── User Row ─────────────────────────────────────────────────────
const UserRow = ({ user, onToggle, actionLoading }) => (
  <div className="px-6 py-4 hover:bg-slate-50/50 transition-colors flex items-center gap-4">
    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-black text-sm flex-shrink-0">
      {user.full_name?.[0]?.toUpperCase() || 'U'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-bold text-slate-900 text-sm truncate">{user.full_name}</p>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          user.role === 'admin'      ? 'bg-purple-50 text-purple-500' :
          user.role === 'mess_owner' ? 'bg-orange-50 text-orange-500' :
                                       'bg-blue-50 text-blue-500'
        }`}>{user.role}</span>
        {!user.is_active && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-500">Suspended</span>
        )}
      </div>
      <p className="text-xs text-slate-400 truncate">{user.email}</p>
    </div>
    {user.role !== 'admin' && (
      <button
        onClick={() => onToggle(user)}
        disabled={actionLoading[user.id]}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 flex-shrink-0 ${
          user.is_active
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
        }`}
      >
        {actionLoading[user.id]
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : user.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
        {user.is_active ? 'Suspend' : 'Reactivate'}
      </button>
    )}
  </div>
);

// ── Review Moderation Panel ───────────────────────────────────────
const ReviewModeration = ({ messes, adminService: svc }) => {
  const [selectedMess, setSelectedMess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingRev, setLoadingRev] = useState(false);
  const [removing, setRemoving] = useState({});

  const activeMesses = messes.filter(m => m.is_active);

  const loadReviews = async (messId) => {
    if (!messId) return;
    setLoadingRev(true);
    try {
      const res = await fetch(`http://localhost:8000/api/messes/${messId}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('trustbite_token')}` }
      });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Failed to load reviews');
    } finally {
      setLoadingRev(false);
    }
  };

  const handleSelect = (id) => { setSelectedMess(id); loadReviews(id); };

  const handleRemove = async (reviewId) => {
    setRemoving(prev => ({ ...prev, [reviewId]: true }));
    try {
      await svc.deactivateReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Review removed');
    } catch (e) {
      toast.error(e.message || 'Failed to remove review');
    } finally {
      setRemoving(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50">
        <h2 className="font-bold text-slate-900 mb-3">Review Moderation</h2>
        <select
          value={selectedMess}
          onChange={e => handleSelect(e.target.value)}
          className="w-full sm:w-72 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-500 bg-white"
        >
          <option value="">Select a mess to review...</option>
          {activeMesses.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {loadingRev && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      )}

      {!loadingRev && selectedMess && (
        <div className="divide-y divide-slate-50">
          {reviews.map(r => (
            <div key={r.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0">
                {r.student_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-sm">{r.student_name || 'Anonymous'}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.comment}</p>}
                <p className="text-[10px] text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <button
                onClick={() => handleRemove(r.id)}
                disabled={removing[r.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 flex-shrink-0"
              >
                {removing[r.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Remove
              </button>
            </div>
          ))}
          {reviews.length === 0 && <EmptyState icon={MessageSquare} msg="No reviews for this mess" />}
        </div>
      )}

      {!loadingRev && !selectedMess && <EmptyState icon={Flag} msg="Select a mess above to moderate its reviews" />}
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, msg }) => (
  <div className="text-center py-16">
    <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
    <p className="text-slate-400 font-medium text-sm">{msg}</p>
  </div>
);

export default AdminDashboard;
