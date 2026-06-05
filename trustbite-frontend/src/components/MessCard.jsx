import React, { useState } from 'react';
import { Star, ShieldCheck, Heart, MapPin, Sparkles, Utensils, X, Coffee, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessCard = ({ mess, reason }) => {
  const [showMenuPreview, setShowMenuPreview] = useState(false);
  // Map backend fields to display-friendly values
  const rating = Number(mess?.avg_rating ?? 0).toFixed(1);
  const trustScore = mess?.trust_score ? Number(mess.trust_score).toFixed(1) : '--';
  const hygieneScore = mess?.hygiene_score ? Number(mess.hygiene_score).toFixed(1) : '--';
  const price = Number(mess?.price_per_meal ?? 0).toFixed(0);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <Link to={`/mess/${mess.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50">
          {mess.image_url ? (
            <img 
              src={mess.image_url} 
              alt={mess.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${mess.image_url ? 'hidden' : ''}`}>
            <span className="text-5xl">{mess.is_veg ? '🥗' : '🍛'}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Reason Badge */}
          {reason && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-orange-100 animate-pulse">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-tight">{reason}</span>
            </div>
          )}

          {/* Rating Badge */}

          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-slate-900">{rating}</span>
            <span className="text-[10px] text-slate-500 font-medium">({mess.total_reviews})</span>
          </div>

          {/* FSSAI Badge */}
          {mess.is_fssai_verified && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <ShieldCheck className="w-3 h-3" /> FSSAI ✓
            </div>
          )}

          {/* Quick Menu Preview Badge */}
          {mess.weekly_menu && Object.keys(mess.weekly_menu).length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenuPreview(true);
              }}
              className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-orange-500 text-white hover:text-white backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-slate-700/50 transition-all z-20 hover:scale-105 transform active:scale-95 duration-150"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Preview Menu</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">
              {mess.name}
            </h3>
            <span className="text-orange-500 font-bold whitespace-nowrap">₹{price}<span className="text-[10px] text-slate-400 font-medium">/meal</span></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{mess.city}{mess.address ? `, ${mess.address}` : ''}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${mess.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{mess.is_veg ? 'Veg' : 'Non-Veg'}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">
              <ShieldCheck className="w-3 h-3" />
              Trust {trustScore}
            </div>
          </div>
        </div>
      </Link>

      {/* Menu Preview Overlay */}
      {showMenuPreview && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-30 p-5 flex flex-col justify-between text-white rounded-2xl animate-fade-in transition-all duration-300">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Today's Menu Schedule
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenuPreview(false);
                }}
                className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4 text-slate-300 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Breakfast */}
              {mess.serves_breakfast && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Coffee className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Breakfast {mess.breakfast_time && `· ${mess.breakfast_time}`}</span>
                    <span className="text-xs text-slate-200 font-medium leading-relaxed block line-clamp-1">{mess.weekly_menu[(() => {
                      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return DAYS[new Date().getDay()];
                    })()]?.breakfast || 'No menu set'}</span>
                  </div>
                </div>
              )}

              {/* Lunch */}
              {mess.serves_lunch && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Lunch {mess.lunch_time && `· ${mess.lunch_time}`}</span>
                    <span className="text-xs text-slate-200 font-medium leading-relaxed block line-clamp-1">{mess.weekly_menu[(() => {
                      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return DAYS[new Date().getDay()];
                    })()]?.lunch || 'No menu set'}</span>
                  </div>
                </div>
              )}

              {/* Dinner */}
              {mess.serves_dinner && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Dinner {mess.dinner_time && `· ${mess.dinner_time}`}</span>
                    <span className="text-xs text-slate-200 font-medium leading-relaxed block line-clamp-1">{mess.weekly_menu[(() => {
                      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return DAYS[new Date().getDay()];
                    })()]?.dinner || 'No menu set'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{(() => {
              const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return DAYS[new Date().getDay()];
            })()}'s Schedule</span>
            <Link
              to={`/mess/${mess.id}`}
              className="text-orange-400 hover:text-orange-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-0.5 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Full Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessCard;
