import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sun, Moon, Coffee, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyMenu = ({ menu, setMenu }) => {
  const [expandedDay, setExpandedDay] = useState('Monday');

  const updateDay = (day, meal, value) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [meal]: value
      }
    }));
  };

  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const DaySection = ({ day }) => {
    const isExpanded = expandedDay === day;
    const isSunday = day === 'Sunday';
    const dayData = menu[day] || { breakfast: '', lunch: '', dinner: '' };

    return (
      <div className={`mb-3 rounded-[24px] border transition-all ${isExpanded ? 'border-orange-200 bg-white shadow-md' : 'border-slate-100 bg-slate-50'}`}>
        <button
          type="button"
          onClick={() => toggleDay(day)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isSunday ? 'bg-purple-500' : 'bg-orange-500'}`} />
            <span className="font-black text-slate-900">{day}</span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 space-y-4">
                {/* Breakfast */}
                {!isSunday && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Coffee className="w-3 h-3" /> Breakfast
                    </label>
                    <textarea
                      placeholder="e.g. Poha, Tea, Upma"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                      value={dayData.breakfast}
                      onChange={(e) => updateDay(day, 'breakfast', e.target.value)}
                    />
                  </div>
                )}

                {/* Lunch */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Sun className="w-3 h-3" /> Lunch {isSunday && <span className="text-purple-500">(Special)</span>}
                  </label>
                  <textarea
                    placeholder="e.g. Dal, Rice, 3 Chapati, 1 Sabji"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                    value={dayData.lunch}
                    onChange={(e) => updateDay(day, 'lunch', e.target.value)}
                  />
                </div>

                {/* Dinner */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Moon className="w-3 h-3" /> Dinner {isSunday && <span className="text-slate-300 ml-auto italic">Optional</span>}
                  </label>
                  <textarea
                    placeholder={isSunday ? "Sunday night service info..." : "e.g. Khichdi, Bhaji, Roti"}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:outline-none focus:border-orange-500 transition-all"
                    value={dayData.dinner}
                    onChange={(e) => updateDay(day, 'dinner', e.target.value)}
                  />
                </div>
                
                {isSunday && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-500 shrink-0" />
                    <p className="text-[11px] text-purple-600 font-medium">
                      Sunday Special: Highlight your premium menu for better student interest!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {DAYS.map(day => <DaySection key={day} day={day} />)}
    </div>
  );
};

export default WeeklyMenu;
