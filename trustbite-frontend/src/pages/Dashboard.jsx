import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Loader2, User, Award, ShieldCheck, Search } from 'lucide-react';
import useStore from '../store/useStore';
import MessCard from '../components/MessCard';
import { favouriteService } from '../services/favouriteService';
import { aiService } from '../services/aiService';
import { statsService } from '../services/statsService';

const Dashboard = () => {
  const { user } = useStore();
  const [favourites, setFavourites] = useState([]);
  const [aiMesses, setAiMesses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [favData, aiData, statsData] = await Promise.allSettled([
          user?.role === 'student' ? favouriteService.getAll() : Promise.resolve([]),
          aiService.getSuggestions({ limit: 3, min_trust: 5.0 }),
          statsService.getPlatformStats(),
        ]);
        if (favData.status === 'fulfilled') setFavourites(favData.value);
        if (aiData.status === 'fulfilled') setAiMesses(aiData.value);
        if (statsData.status === 'fulfilled') setStats(statsData.value);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const roleBadge = user?.role === 'admin' ? 'Admin' : user?.role === 'mess_owner' ? 'Mess Owner' : 'Student';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border-4 border-white shadow-xl relative z-10">
            <span className="text-4xl font-black text-orange-500">{user?.full_name?.[0] || 'U'}</span>
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Hello, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-slate-500 font-medium text-lg mb-4">Welcome to your TrustBite dashboard</p>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> {roleBadge}
            </span>
          </div>
        </motion.div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Messes', value: stats.total_messes, color: 'bg-orange-50 text-orange-600' },
              { label: 'Students', value: stats.total_students, color: 'bg-blue-50 text-blue-600' },
              { label: 'Reviews', value: stats.total_reviews, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Avg Trust', value: stats.avg_trust_score, color: 'bg-purple-50 text-purple-600' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className={`text-3xl font-black mb-1 ${s.color.split(' ')[1]}`}>{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            {/* AI Recommendations */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-purple-50 rounded-xl"><Sparkles className="w-6 h-6 text-purple-500" /></div>
                <h2 className="text-2xl font-bold text-slate-900">AI Recommendations</h2>
              </div>
              {aiMesses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {aiMesses.map(m => <MessCard key={m.id} mess={m} />)}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-400 font-medium">
                  No AI recommendations available yet.
                </div>
              )}
            </div>

            {/* Favourites */}
            {user?.role === 'student' && (
              <div>
                <div className="flex justify-between items-end mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 rounded-xl"><Heart className="w-6 h-6 text-orange-500 fill-current" /></div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Favourites</h2>
                  </div>
                  <Link to="/favourites" className="text-orange-500 font-bold text-sm hover:underline">View all</Link>
                </div>
                {favourites.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {favourites.slice(0, 4).map(f => f.mess && <MessCard key={f.id} mess={f.mess} />)}
                  </div>
                ) : (
                  <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-slate-200">
                    <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No favourites yet. Start exploring!</p>
                    <Link to="/discover" className="inline-block mt-4 bg-orange-500 text-white px-6 py-2 rounded-2xl font-bold text-sm">Discover Messes</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl mb-[-40px] mr-[-40px]" />
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/discover" className="flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white py-2 transition-colors">
                  <Search className="w-4 h-4" /> Discover Messes
                </Link>
                {user?.role === 'student' && (
                  <Link to="/favourites" className="flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white py-2 transition-colors">
                    <Heart className="w-4 h-4" /> My Favourites
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
