import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, MapPin } from 'lucide-react';
import useStore from '../store/useStore';
import MessCard from '../components/MessCard';
import FilterSidebar from '../components/FilterSidebar';

// Extended Dummy Data
const allMesses = [
  { id: 1, name: "Annapurna Mess", avg_rating: 4.8, total_reviews: 156, city: "R.C. Patel Campus, Shirpur", monthly_price: 3200, food_type: "veg", trust_score: 98, hygiene_score: 4.5 },
  { id: 2, name: "Shree Ganesh Tiffin", avg_rating: 4.6, total_reviews: 92, city: "Main Market, Shirpur", monthly_price: 2800, food_type: "veg+nonveg", trust_score: 95, hygiene_score: 4.2 },
  { id: 3, name: "Maa Tiffin Service", avg_rating: 4.9, total_reviews: 210, city: "Karvand Naka, Shirpur", monthly_price: 3500, food_type: "veg", trust_score: 99, hygiene_score: 4.9 },
  { id: 4, name: "Student Paradise", avg_rating: 4.2, total_reviews: 45, city: "Nimzari Road, Shirpur", monthly_price: 2600, food_type: "veg+egg", trust_score: 90, hygiene_score: 3.8 },
  { id: 5, name: "Healthy Bites", avg_rating: 4.5, total_reviews: 78, city: "Subhash Colony, Shirpur", monthly_price: 4200, food_type: "veg", trust_score: 96, hygiene_score: 4.7 },
  { id: 6, name: "Local Spices Mess", avg_rating: 4.0, total_reviews: 34, city: "Old City, Shirpur", monthly_price: 2200, food_type: "veg+nonveg", trust_score: 85, hygiene_score: 3.5 },
];

const DiscoveryPage = () => {
  const { filters, setFilters } = useStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMesses = allMesses.filter(mess => {
    const matchesType = filters.type === 'all' || mess.food_type === filters.type;
    const matchesPrice = mess.monthly_price <= filters.priceRange[1];
    const matchesRating = mess.avg_rating >= filters.rating;
    const matchesSearch = mess.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mess.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesPrice && matchesRating && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header / Search Area */}
      <div className="bg-white border-b border-neutral-100 py-8 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Discovery</h1>
              <p className="text-neutral-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand" />
                Showing {filteredMesses.length} messes in Shirpur
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search mess name or location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/10 text-sm font-medium"
                />
              </div>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden p-3 bg-white border border-neutral-200 rounded-2xl"
              >
                <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </aside>

          {/* Grid Area */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 text-sm font-bold text-neutral-400 uppercase tracking-widest">
                <span>Recent Listings</span>
                <span className="w-1.5 h-1.5 bg-neutral-200 rounded-full"></span>
                <span className="text-neutral-900">Most Trusted</span>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-brand transition-colors">
                <ArrowUpDown className="w-4 h-4" />
                Sort By
              </button>
            </div>

            {filteredMesses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredMesses.map(mess => (
                  <MessCard key={mess.id} mess={mess} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-neutral-200">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">No messes found</h3>
                <p className="text-neutral-500 mb-8">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => setFilters({ type: 'all', priceRange: [0, 5000], rating: 0 })}
                  className="bg-brand text-white px-8 py-3 rounded-2xl font-bold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm md:hidden">
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-[40px] animate-in slide-in-from-bottom duration-500">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              onClose={() => setShowMobileFilters(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
