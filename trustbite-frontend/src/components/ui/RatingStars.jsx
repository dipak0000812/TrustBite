import { Star } from 'lucide-react';

export default function RatingStars({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : star - rating < 1
              ? 'text-amber-400 fill-amber-400 opacity-50'
              : 'text-slate-200 fill-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
