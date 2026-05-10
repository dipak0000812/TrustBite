import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, ChevronDown, Grid3X3, List, ArrowDown, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { messService } from '../services/messService';
import { MessCardSkeleton } from '../components/Skeleton';
import MessCard from '../components/MessCard';

const CUISINE_EMOJI = { maharashtrian: '🍛', south_indian: '🥘', north_indian: '🫓', gujarati: '🥗', rajasthani: '🫕', multi_cuisine: '🍱' };
const FLOAT_DELAYS = [0, 0.5, 1.0, 1.5, 0.8, 0.3, 0.7, 1.2];

const cuisines = [
  { key: '', label: '🍽 All Cuisines' },
  { key: 'maharashtrian', label: 'Maharashtrian' },
  { key: 'south_indian', label: 'South Indian' },
  { key: 'north_indian', label: 'North Indian' },
  { key: 'gujarati', label: 'Gujarati' },
  { key: 'rajasthani', label: 'Rajasthani' },
  { key: 'multi_cuisine', label: 'Multi Cuisine' },
];

const DiscoveryPage = () => {
  const location = useLocation();
  const initialSearch = new URLSearchParams(location.search).get('search') || '';

  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCuisine, setActiveCuisine] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const fetchMesses = async () => {
    if (fetching) return;
    const currentQuery = searchQuery;
    setFetching(true);
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (activeCuisine) params.cuisine_type = activeCuisine;
      if (vegOnly) params.is_veg = true;
      const data = await messService.getAll(params);
      
      if (currentQuery === searchQuery) {
        setMesses(data);
      }
    } catch (error) {
      console.error('Failed to fetch messes:', error);
      if (currentQuery === searchQuery) {
        setMesses([]);
      }
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchMesses, 350);
    return () => clearTimeout(t);
  }, [searchQuery, activeCuisine, vegOnly]);

  const getEmoji = (m) => m.emoji || CUISINE_EMOJI[m.cuisine_type] || '🍛';

  return (
    <div className="min-h-screen" style={{ background: '#F8F4F0' }}>

      {/* ─── SECTION 1: Page Header ─── */}
      <div className="bg-white border-b pt-24 pb-6 px-4 sm:px-0" style={{ borderColor: '#F3E8DA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <p className="hidden lg:block text-[11px] text-[#9CA3AF] font-bold mb-2 uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                <span className="mx-1.5">/</span>
                <span className="text-[#6B7280]">Discover</span>
              </p>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#111827] mb-2 leading-tight">Discover Messes</h1>
              <p className="flex items-center justify-center lg:justify-start gap-1.5 text-[13px]">
                <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="text-[#F97316] font-black uppercase tracking-wider">2,400+ Verified · Pune</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Search bar */}
              <div className="relative w-full sm:w-[280px] lg:w-[340px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F97316]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search area or cuisine..."
                  className="w-full pl-11 pr-4 py-3 text-[13px] font-bold rounded-2xl outline-none transition-all duration-200 bg-slate-50"
                  style={{
                    border: '2px solid #F3E8DA',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = '#F97316'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#F3E8DA'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
              {/* Sort button */}
              <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl text-[13px] font-black text-[#F97316] transition-all hover:bg-[#FFF7ED] border-2 border-[#F97316]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Sort <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Filter Chip Row (sticky) ─── */}
      <div className="bg-white sticky top-16 lg:top-20 z-40 border-b" style={{ borderColor: '#F3E8DA' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5">
          {/* Primary cuisine chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {cuisines.map((c, i) => (
              <motion.button
                key={c.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setActiveCuisine(c.key)}
                className="flex-shrink-0 px-[18px] py-2 rounded-full text-[13px] font-medium transition-all duration-150 whitespace-nowrap"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: activeCuisine === c.key ? '#F97316' : 'white',
                  color: activeCuisine === c.key ? 'white' : '#374151',
                  border: `1.5px solid ${activeCuisine === c.key ? '#F97316' : '#E5E7EB'}`,
                  boxShadow: activeCuisine === c.key ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
                }}
                onMouseEnter={e => { if (activeCuisine !== c.key) { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316'; e.currentTarget.style.background = '#FFF7ED'; } }}
                onMouseLeave={e => { if (activeCuisine !== c.key) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'white'; } }}
              >
                {c.label}
              </motion.button>
            ))}

            {/* Divider */}
            <span className="flex-shrink-0 w-px h-6 mx-1" style={{ background: '#E5E7EB' }} />

            {/* Veg Only */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className="flex-shrink-0 flex items-center gap-1.5 px-[18px] py-2 rounded-full text-[13px] font-medium transition-all duration-150 whitespace-nowrap"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: vegOnly ? '#22C55E' : 'white',
                color: vegOnly ? 'white' : '#374151',
                border: `1.5px solid ${vegOnly ? '#22C55E' : '#E5E7EB'}`,
                boxShadow: vegOnly ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
              }}
            >
              <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-[#22C55E]'}`} />
              Veg Only
            </button>
          </div>

        </div>
      </div>

      {/* ─── SECTION 3: Results Count + View Toggle ─── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <p className="text-[13px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B7280' }}>
          Showing <span className="text-[#111827] font-bold">{loading ? '...' : messes.length}</span> messes <span className="text-[#F97316]">in Pune</span>
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#F97316] text-white' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#F97316] text-white' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── SECTION 4: Mess Cards Grid ─── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
            {[...Array(6)].map((_, i) => (
              <MessCardSkeleton key={i} />
            ))}
          </div>
        ) : messes.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
            {messes.map((mess) => (
              <MessCard key={mess.id} mess={mess} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-100 shadow-sm px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No matching messes found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-bold mb-8 leading-relaxed">
              We couldn&apos;t find any messes matching your current filters. Try expanding your search or clearing filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCuisine(''); setVegOnly(false); }}
              className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>


      {/* Float animation keyframes */}
      <style>{`
        @keyframes card-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default DiscoveryPage;
