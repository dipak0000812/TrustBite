import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { cardHover } from '../../lib/motion';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import RatingStars from '../ui/RatingStars';

export default function MessCard({ mess }) {
  const {
    name, cuisine, rating, reviewCount, trustScore,
    pricePerMeal, imageUrl, isVerified, tags, distance, openNow
  } = mess;

  return (
    <motion.article
      variants={cardHover} initial='rest' whileHover='hover'
      className='bg-white rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col'
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
    >

      {/* Image area */}
      <div className='relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200'>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-6xl'>🍱</div>
        )}

        {/* Overlay chips */}
        <div className='absolute top-3 left-3 flex gap-2'>
          {isVerified && (
            <span className='bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg'>
              ✓ Verified
            </span>
          )}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg ${openNow ? 'bg-white text-emerald-600' : 'bg-white text-slate-500'}`}>
            {openNow ? '● Open' : '● Closed'}
          </span>
        </div>

        {/* Trust score on image */}
        <div className='absolute top-3 right-3'>
          <TrustScoreBadge score={trustScore} size='sm' />
        </div>
      </div>

      {/* Card body */}
      <div className='p-5 flex flex-col flex-1'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <h3 className='font-display font-bold text-slate-900 text-base leading-snug line-clamp-1'>{name}</h3>
          <span className='text-sm font-bold text-slate-900 whitespace-nowrap flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg'>
            ₹{pricePerMeal}<span className='text-xs font-normal text-slate-400'>/meal</span>
          </span>
        </div>

        <p className='text-slate-500 text-xs mb-3'>{cuisine}</p>

        <div className='flex items-center gap-1 mb-3'>
          <RatingStars rating={rating} size={14} />
          <span className='text-slate-800 font-semibold text-sm ml-1'>{rating}</span>
          <span className='text-slate-400 text-[10px] font-medium'>({reviewCount} reviews)</span>
        </div>

        {/* Tags */}
        <div className='flex flex-wrap gap-1.5 mb-4'>
          {tags?.slice(0,3).map(tag => (
            <span key={tag} className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 tracking-wide uppercase'>{tag}</span>
          ))}
        </div>

        {/* Footer row */}
        <div className='mt-auto flex items-center justify-between pt-3 border-t border-slate-50'>
          <div className='flex items-center gap-1 text-slate-500 text-[10px] font-bold'>
            <MapPin size={12} />
            <span>{distance}</span>
          </div>
          <button className='text-orange-500 font-bold text-xs flex items-center gap-1 hover:text-orange-600 transition-colors'>
            View Details
            <span className='text-base'>→</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
