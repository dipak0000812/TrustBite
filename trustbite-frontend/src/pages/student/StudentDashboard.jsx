import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Loader2, User, Award, ShieldCheck, Search, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import MessCard from '../../components/MessCard';
import { favouriteService } from '../../services/favouriteService';
import { aiService } from '../../services/aiService';
import { statsService } from '../../services/statsService';
import { MessCardSkeleton, Skeleton } from '../../components/Skeleton';

const Dashboard = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [aiMesses, setAiMesses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get personalized reasoning for a mess
  const getReason = (mess) => {
    const prefsRaw = localStorage.getItem('trustbite_user_prefs');
    if (!prefsRaw) return null;
    try {
      const prefs = JSON.parse(prefsRaw);
      if (prefs.diet === 'Veg Only' && mess.is_veg) return 'Matches your diet';
      if (prefs.city === mess.city) return 'Near your location';
      if (prefs.budget === 'Low' && mess.price_per_meal < 60) return 'Budget friendly';
      if (prefs.priority.includes('Hygiene') && mess.hygiene_score > 4.5) return 'Top Hygiene';
      return 'Top Rated';
    } catch (e) { return null; }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) setLoading(true);
      try {
        const [favData, aiData] = await Promise.allSettled([
          user?.role === 'student' ? favouriteService.getAll() : Promise.resolve([]),
          aiService?.getSuggestions 
            ? aiService.getSuggestions({ limit: 4, min_trust: 4.0 }) 
            : Promise.resolve([]),
        ]);
        
        if (mounted) {
          if (favData.status === 'fulfilled') setFavourites(favData.value);
          if (aiData.status === 'fulfilled') {
            // Deduplicate and filter based on diet if Veg Only
            const raw = aiData.value || [];
            const prefs = JSON.parse(localStorage.getItem('trustbite_user_prefs') || '{}');
            let filtered = raw;
            if (prefs.diet === 'Veg Only') {
              filtered = raw.filter(m => m.is_veg);
            }
            setAiMesses(filtered.slice(0, 4));
          }
          setLoading(false);
        }
      } catch (e) { 
        console.error(e);
        if (mounted) setLoading(false);
      }
    };
    load();
    
    // Security & Onboarding check
    if (user?.role !== 'student') {
      navigate(user?.role === 'mess_owner' ? '/owner/dashboard' : '/');
      return;
    }

    const isComplete = localStorage.getItem('trustbite_student_onboarding_complete');
    if (isComplete !== 'true') {
      navigate('/student/onboarding');
    }

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const roleBadge = user?.role === 'admin' ? 'Admin' : user?.role === 'mess_owner' ? 'Mess Owner' : 'Student';

  const DashboardSkeleton = () => (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid sm:grid-cols-2 gap-6">
                <MessCardSkeleton />
                <MessCardSkeleton />
              </div>
            </div>
          </div>
          <Skeleton className="h-64 rounded-[32px]" />
        </div>
      </div>
    </div>
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-8 sm:mb-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden mx-2 sm:mx-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 flex items-center justify-center border-4 border-white shadow-xl relative z-10 flex-shrink-0">
            <span className="text-2xl sm:text-3xl font-black text-orange-500">{user?.full_name?.[0] || 'U'}</span>
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 leading-tight tracking-tight">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-slate-400 font-bold text-sm sm:text-base mb-4">Your personalized mess guide is ready</p>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100/50">
              <ShieldCheck className="w-3.5 h-3.5" /> {roleBadge}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-12">

            {/* Personalized Recommendations */}
            <div>
              <div className="flex items-center gap-3 mb-8 px-2 sm:px-0">
                <div className="p-2 bg-purple-50 rounded-xl"><Sparkles className="w-5 h-5 text-purple-500" /></div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Picked for You</h2>
              </div>
              {Array.isArray(aiMesses) && aiMesses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
                  {aiMesses.map(m => <MessCard key={m.id} mess={m} reason={getReason(m)} />)}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center mx-2 sm:mx-0">
                  <div className="w-16 h-16 bg-purple-50 text-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">No personalized matches yet</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Try updating your preferences or explore more messes to help our AI learn!</p>
                  <Link to="/discover" className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors">
                    Explore All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Favourites */}
            {user?.role === 'student' && (
              <div>
                <div className="flex justify-between items-center mb-8 px-2 sm:px-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl"><Heart className="w-5 h-5 text-orange-500 fill-current" /></div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Favourites</h2>
                  </div>
                  {Array.isArray(favourites) && favourites.length > 0 && (
                    <Link to="/favourites" className="text-orange-500 font-bold text-sm hover:underline">View all</Link>
                  )}
                </div>
                {Array.isArray(favourites) && favourites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
                    {favourites
                      .filter(f => f?.mess)
                      .slice(0, 2)
                      .map(f => (
                        <MessCard key={f.id} mess={f.mess} />
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-100 mx-2 sm:mx-0">
                    <div className="w-16 h-16 bg-orange-50 text-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Your library is empty</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto font-bold">Save your favorite messes to quickly access their menus and reviews later.</p>
                    <Link to="/discover" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20">
                      Find My First Mess
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 px-2 sm:px-0">
            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl mb-[-40px] mr-[-40px]" />
              <h3 className="text-lg font-bold mb-6 tracking-tight">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/discover" className="flex items-center justify-between group p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold flex items-center gap-3"><Search className="w-4 h-4 text-orange-500" /> Search Nearby</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
                {user?.role === 'student' && (
                  <Link to="/student/onboarding" className="flex items-center justify-between group p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm font-bold flex items-center gap-3"><Sparkles className="w-4 h-4 text-purple-400" /> Update Preferences</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                )}
              </div>
            </div>

            {/* Platform Stats (Reduced) */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Platform Growth</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-xl font-black text-slate-900">2.4k+</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Messes</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-xl font-black text-slate-900">18k+</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Students</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
