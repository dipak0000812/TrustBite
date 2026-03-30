import React from 'react';
import { Star, ShieldCheck, Heart, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const MessCard = ({ mess }) => {
  const { favourites, toggleFavourite } = useStore();
  const isFavourite = favourites.includes(mess.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-100 shadow-card hover:shadow-premium transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Favorite Button (Overlay outside Link) */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavourite(mess.id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md z-20 transition-all ${
          isFavourite ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-black/20 text-white hover:bg-white hover:text-brand'
        }`}
      >
        <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} />
      </button>

      <Link to={`/mess/${mess.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img 
            src={mess.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&sig=${mess.id}`} 
            alt={mess.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-neutral-900">{mess.avg_rating}</span>
            <span className="text-[10px] text-neutral-500 font-medium">({mess.total_reviews})</span>
          </div>

          {/* Hygiene Tag */}
          <div className="absolute top-3 left-3 bg-hygiene text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <ShieldCheck className="w-3 h-3" />
            Hygiene {mess.hygiene_score}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand transition-colors line-clamp-1">
              {mess.name}
            </h3>
            <span className="text-brand font-bold">₹{mess.monthly_price}<span className="text-[10px] text-neutral-400 font-medium">/mo</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 text-neutral-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{mess.city}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${mess.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">{mess.food_type}</span>
            </div>
            
            <div className="flex items-center gap-1 text-trust font-bold text-xs bg-trust-light px-2 py-1 rounded-md">
              <ShieldCheck className="w-3 h-3" />
              Trust {mess.trust_score}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MessCard;
