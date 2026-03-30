import React from 'react';
import { Filter, X } from 'lucide-react';

const FilterSidebar = ({ filters, setFilters, onClose }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-card h-fit sticky top-24">
      <div className="flex justify-between items-center mb-6 md:hidden">
        <h3 className="font-bold text-lg">Filters</h3>
        <button onClick={onClose}><X className="w-5 h-5" /></button>
      </div>

      {/* Food Type */}
      <div className="mb-8">
        <h4 className="font-bold text-sm text-neutral-900 mb-4 uppercase tracking-wider">Food Type</h4>
        <div className="space-y-3">
          {['all', 'veg', 'veg+egg', 'veg+nonveg'].map((type) => (
            <label key={type} className="flex items-center group cursor-pointer">
              <input 
                type="radio" 
                name="foodType"
                checked={filters.type === type}
                onChange={() => setFilters({ type })}
                className="w-4 h-4 text-brand bg-neutral-100 border-neutral-200 focus:ring-brand"
              />
              <span className="ml-3 text-sm font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors capitalize">
                {type.replace('+', ' & ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-bold text-sm text-neutral-900 mb-4 uppercase tracking-wider">Monthly Price</h4>
        <input 
          type="range" 
          min="2000" 
          max="5000" 
          step="100"
          value={filters.priceRange[1]}
          onChange={(e) => setFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
          className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-brand"
        />
        <div className="flex justify-between mt-2 text-xs font-bold text-neutral-400">
          <span>₹2,000</span>
          <span className="text-brand">Up to ₹{filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-8">
        <h4 className="font-bold text-sm text-neutral-900 mb-4 uppercase tracking-wider">Min Rating</h4>
        <div className="flex gap-2">
          {[3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters({ rating })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                filters.rating === rating 
                ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              {rating}+ ★
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => setFilters({ type: 'all', priceRange: [0, 5000], rating: 0 })}
        className="w-full py-3 text-sm font-bold text-neutral-400 hover:text-brand transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default FilterSidebar;
