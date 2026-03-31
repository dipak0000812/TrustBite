import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, ClipboardList, Loader2 } from 'lucide-react';
import { statsService } from '../services/statsService';
import { messService } from '../services/messService';
import { authService } from '../services/authService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [messes, setMesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, messData, userData] = await Promise.all([
          statsService.getPlatformStats(),
          messService.getAll({ limit: 50 }),
          authService.getUsers(),
        ]);
        setStats(statsData);
        setMesses(messData);
        setUsers(userData);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mb-8">Manage messes, users, and platform health.</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: ClipboardList, label: 'Active Messes', value: stats.total_messes, color: 'bg-orange-50 text-orange-500' },
              { icon: Users, label: 'Total Students', value: stats.total_students, color: 'bg-blue-50 text-blue-500' },
              { icon: ShieldCheck, label: 'Total Reviews', value: stats.total_reviews, color: 'bg-emerald-50 text-emerald-500' },
              { icon: ShieldCheck, label: 'Avg Trust Score', value: stats.avg_trust_score, color: 'bg-purple-50 text-purple-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color.split(' ')[0]}`}>
                  <s.icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Users ({users.length})</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-500' :
                          u.role === 'mess_owner' ? 'bg-orange-50 text-orange-500' :
                          'bg-blue-50 text-blue-500'
                        }`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Messes Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Messes ({messes.length})</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trust</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">FSSAI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {messes.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.city}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600 text-sm">{m.trust_score ? Number(m.trust_score).toFixed(1) : '--'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {m.is_fssai_verified ? <span className="text-emerald-500 text-sm">✅</span> : <span className="text-slate-300 text-sm">❌</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
