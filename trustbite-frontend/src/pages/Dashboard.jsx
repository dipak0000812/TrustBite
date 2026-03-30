import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Bell, Settings, Award, ShieldCheck, User } from 'lucide-react';
import useStore from '../store/useStore';
import MessCard from '../components/MessCard';

const Dashboard = () => {
  const { user, favourites } = useStore();

  // Dummy Dashboard Data
  const recentMesses = [
    { id: 1, name: "Annapurna Mess", avg_rating: 4.8, total_reviews: 156, city: "R.C. Patel Campus, Shirpur", monthly_price: 3200, food_type: "veg", trust_score: 98, hygiene_score: 4.5 },
    { id: 3, name: "Maa Tiffin Service", avg_rating: 4.9, total_reviews: 210, city: "Karvand Naka, Shirpur", monthly_price: 3500, food_type: "veg", trust_score: 99, hygiene_score: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-neutral-100 shadow-premium mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="w-32 h-32 rounded-full bg-brand-light flex items-center justify-center border-4 border-white shadow-xl relative z-10">
            <User className="w-16 h-16 text-brand" />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-4xl font-black text-neutral-900 mb-2">Hello, {user?.name || 'Student'}!</h1>
            <p className="text-neutral-500 font-medium text-lg mb-6">You've visited 12 messes this month. Staying healthy!</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-neutral-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                Silver Member
              </span>
              <span className="bg-trust-light text-trust px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-4 relative z-10">
            <button className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:border-brand transition-all group">
              <Bell className="w-6 h-6 text-neutral-400 group-hover:text-brand" />
            </button>
            <button className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:border-brand transition-all group">
              <Settings className="w-6 h-6 text-neutral-400 group-hover:text-brand" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Favourites Section */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-light rounded-xl">
                    <Heart className="w-6 h-6 text-brand fill-current" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">Your Favourites</h2>
                </div>
                <Link to="/discovery" className="text-brand font-bold text-sm">Explore more</Link>
              </div>
              
              {favourites.length > 0 ? (
                 <div className="grid sm:grid-cols-2 gap-8">
                    {recentMesses.slice(0, 2).map(mess => (
                      <MessCard key={mess.id} mess={mess} />
                    ))}
                 </div>
              ) : (
                <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-neutral-200">
                  <Heart className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                  <p className="text-neutral-500 font-medium">No favourites added yet.</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-trust-light rounded-xl">
                  <Clock className="w-6 h-6 text-trust" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Recommended for You</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-8 opacity-60">
                 {/* This would come from AI module */}
                 <div className="bg-white rounded-3xl p-6 border border-neutral-100 flex items-center justify-center min-h-[100px] text-neutral-400 font-medium italic">
                    AI recommendations loading...
                 </div>
              </div>
            </div>

          </div>

          {/* Sidebar: Activity/Stats */}
          <div className="space-y-8">
            <div className="bg-neutral-900 text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-3xl mb-[-40px] mr-[-40px]"></div>
               <h3 className="text-lg font-bold mb-6">Mess Stats</h3>
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                     <span>Hygiene Average</span>
                     <span className="text-white">4.6/5.0</span>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="w-[92%] h-full bg-trust rounded-full"></div>
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                     <span>Nutrition Balance</span>
                     <span className="text-white">High</span>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="w-[85%] h-full bg-brand rounded-full"></div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
              <h3 className="font-bold text-neutral-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
                  <Clock className="w-6 h-6 text-neutral-600" />
                  <span className="text-[10px] font-bold uppercase text-neutral-500">History</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-neutral-600" />
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Audits</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
