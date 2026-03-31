import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, ChevronDown, Grid3X3, List, ArrowDown, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { messService } from '../services/messService';

/* ── Static fallback data per spec ─────────────────────── */
const STATIC_MESSES = [
  { id: 1, name: 'Punjabi Dhaba Express', cuisine_type: 'north_indian', price_per_meal: 95, city: 'Pune', address: 'Ground Floor, Pinnacle Tower, Baner Road', avg_rating: 4.9, total_reviews: 445, trust_score: 9.4, is_veg: false, is_fssai_verified: true, emoji: '🫓', floatDelay: 0 },
  { id: 2, name: 'Grihini Kitchen', cuisine_type: 'multi_cuisine', price_per_meal: 72, city: 'Pune', address: 'Building C, EON IT Park Road, Kharadi', avg_rating: 4.8, total_reviews: 189, trust_score: 9.2, is_veg: true, is_fssai_verified: true, emoji: '🍱', floatDelay: 0.5 },
  { id: 3, name: 'Shree Sai Mess', cuisine_type: 'maharashtrian', price_per_meal: 80, city: 'Pune', address: 'Lane 4, Near Symbiosis Gate 2, Viman Nagar', avg_rating: 4.7, total_reviews: 312, trust_score: 9.1, is_veg: true, is_fssai_verified: true, emoji: '🍛', floatDelay: 1.0 },
  { id: 4, name: 'Annapoorna Bhojanalay', cuisine_type: 'south_indian', price_per_meal: 65, city: 'Pune', address: 'Karve Nagar, Near Garware College', avg_rating: 4.6, total_reviews: 278, trust_score: 8.9, is_veg: true, is_fssai_verified: true, emoji: '🥘', floatDelay: 1.5 },
  { id: 5, name: 'Sai Krupa Dining Hall', cuisine_type: 'gujarati', price_per_meal: 75, city: 'Pune', address: 'Kothrud, Near Vandevi Mandir Road', avg_rating: 4.7, total_reviews: 203, trust_score: 9.0, is_veg: true, is_fssai_verified: true, emoji: '🥗', floatDelay: 0.8 },
  { id: 6, name: 'Delhi Darbar Mess', cuisine_type: 'north_indian', price_per_meal: 90, city: 'Pune', address: 'Hadapsar, MIDC Road, Near Magarpatta', avg_rating: 4.5, total_reviews: 167, trust_score: 8.7, is_veg: false, is_fssai_verified: true, emoji: '🫓', floatDelay: 0.3 },
];

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
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const fetchMesses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (activeCuisine) params.cuisine_type = activeCuisine;
      if (vegOnly) params.is_veg = true;
      const data = await messService.getAll(params);
      setMesses(data.length > 0 ? data : STATIC_MESSES);
    } catch {
      setMesses(STATIC_MESSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMesses(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchMesses, 350);
    return () => clearTimeout(t);
  }, [searchQuery, activeCuisine, vegOnly]);

  const getEmoji = (m) => m.emoji || CUISINE_EMOJI[m.cuisine_type] || '🍛';

  return (
    <div className="min-h-screen" style={{ background: '#F8F4F0' }}>

      {/* ─── SECTION 1: Page Header ─── */}
      <div className="bg-white border-b pt-24 pb-6" style={{ borderColor: '#F3E8DA' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
                <span className="mx-1.5">/</span>
                <span className="text-[#6B7280]">Discover</span>
              </p>
              <h1 className="font-display font-bold text-[28px] text-[#111827] mb-1.5">Discover Messes</h1>
              <p className="flex items-center gap-1.5 text-[13px]">
                <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="text-[#F97316] font-medium">Showing 2,400+ verified messes · Pune</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F97316]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mess, area, cuisine..."
                  className="w-[280px] lg:w-[340px] pl-11 pr-4 py-3 text-[13px] font-medium rounded-full outline-none transition-all duration-200"
                  style={{
                    border: '1.5px solid #F3E8DA',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#F3E8DA'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {/* Sort button */}
              <button className="flex items-center gap-1.5 px-4 py-3 rounded-full text-[13px] font-medium text-[#F97316] transition-colors hover:bg-[#FFF7ED]"
                style={{ border: '1.5px solid #F97316', fontFamily: "'DM Sans', sans-serif" }}>
                Sort by <ChevronDown className="w-3.5 h-3.5" />
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

          {/* Secondary quick filters */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { label: '⭐ 4.5+ Rating', key: 'rating' },
              { label: '🛡 Trust 9+', key: 'trust' },
              { label: '₹ Under ₹80', key: 'price' },
              { label: '📍 Within 1km', key: 'distance' },
              { label: '✓ FSSAI Verified', key: 'fssai' },
            ].map(f => (
              <button key={f.key}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap hover:border-[#F97316] hover:text-[#F97316] hover:bg-[#FFF7ED]"
                style={{ fontFamily: "'DM Sans', sans-serif", border: '1.5px solid #E5E7EB', color: '#6B7280' }}
              >
                {f.label}
              </button>
            ))}
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
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#F97316]" /></div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
            {messes.map((mess, i) => (
              <MessCard key={mess.id || i} mess={mess} index={i} getEmoji={getEmoji} />
            ))}
          </div>
        )}
      </div>

      {/* ─── SECTION 5: Load More ─── */}
      <div className="text-center pb-20 pt-4">
        <p className="text-[13px] text-[#6B7280] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Showing {messes.length} of <span className="font-bold text-[#111827]">2,400+</span> verified messes
        </p>
        <button
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[13px] font-semibold transition-all duration-200 hover:bg-[#FFF7ED]"
          style={{ fontFamily: "'DM Sans', sans-serif", border: '1.5px solid #F97316', color: '#F97316', width: 240 }}
        >
          <ArrowDown className="w-4 h-4" /> Load More Messes
        </button>
        <p className="text-[11px] text-[#9CA3AF] mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Updated 2 minutes ago · 2,400+ messes verified
        </p>
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

/* ─── Premium Mess Card Component ─── */
function MessCard({ mess, index, getEmoji }) {
  const [hovered, setHovered] = useState(false);
  const rating = Number(mess.avg_rating || 0).toFixed(1);
  const trust = mess.trust_score ? Number(mess.trust_score).toFixed(1) : '--';
  const price = Number(mess.price_per_meal || 0).toFixed(0);
  const floatDelay = mess.floatDelay ?? FLOAT_DELAYS[index % FLOAT_DELAYS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link to={`/mess/${mess.id}`}>
        <div
          className="bg-white rounded-[20px] overflow-hidden cursor-pointer flex flex-col h-full"
          style={{
            border: `1px solid ${hovered ? '#F97316' : '#F3E8DA'}`,
            boxShadow: hovered ? '0 12px 32px rgba(249,115,22,0.14)' : '0 2px 12px rgba(0,0,0,0.06)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* ── Image Zone ── */}
          <div className="relative h-[180px] overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #FFF3E0 0%, #F5DEB3 100%)' }}>

            {/* FSSAI Badge */}
            {mess.is_fssai_verified && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-white text-[11px] font-semibold"
                style={{ background: '#15803D', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontFamily: "'DM Sans', sans-serif" }}>
                <ShieldCheck className="w-3 h-3" /> FSSAI ✓
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-[20px]"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              <Star className="w-3 h-3 text-[#F97316] fill-[#F97316]" />
              <span className="text-[12px] font-bold text-[#111827]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{rating}</span>
              <span className="text-[10px] text-[#9CA3AF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>({mess.total_reviews})</span>
            </div>

            {/* Food emoji — centered float */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[80px] select-none pointer-events-none"
                style={{
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
                  animation: `card-float 3s ease-in-out infinite`,
                  animationDelay: `${floatDelay}s`,
                }}
              >
                {getEmoji(mess)}
              </span>
            </div>
          </div>

          {/* ── Card Body ── */}
          <div className="px-4 pt-4 pb-3 flex-1 flex flex-col">
            {/* Row 1: Name + Price */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-bold text-[16px] text-[#111827] truncate leading-snug">{mess.name}</h3>
              <span className="flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-[#F97316] font-semibold text-[14px]">₹{price}</span>
                <span className="text-[#9CA3AF] text-[11px]">/meal</span>
              </span>
            </div>

            {/* Row 2: Location */}
            <div className="flex items-center gap-1 mb-2.5">
              <MapPin className="w-3 h-3 text-[#F97316] flex-shrink-0" />
              <span className="text-[12px] text-[#6B7280] truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {mess.address ? `${mess.city}, ${mess.address}` : mess.city}
              </span>
            </div>

            {/* Row 3: Divider */}
            <div className="h-px mb-2.5" style={{ background: '#F9F0E8' }} />

            {/* Row 4: Veg/Non-veg + Trust Score */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px', color: mess.is_veg ? '#22C55E' : '#EF4444' }}>
                <span className={`w-2.5 h-2.5 rounded-full ${mess.is_veg ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                {mess.is_veg ? 'VEG' : 'NON-VEG'}
              </span>

              {/* Trust Score — THE HERO ELEMENT */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-transform duration-250"
                style={{
                  background: '#F0FDF4',
                  border: `1.5px solid ${hovered ? '#22C55E' : '#86EFAC'}`,
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                <span className="text-[11px] text-[#6B7280]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Trust</span>
                <span className="text-[16px] font-bold text-[#16A34A] leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{trust}</span>
              </div>
            </div>
          </div>

          {/* ── Card Footer ── */}
          <div className="px-4 pb-4">
            <div
              className="w-full py-2 rounded-[10px] text-center text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 group/btn"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                border: '1.5px solid #F97316',
                color: hovered ? 'white' : '#F97316',
                background: hovered ? '#F97316' : 'transparent',
              }}
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)' }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default DiscoveryPage;
