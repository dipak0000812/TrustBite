import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin, ArrowLeft, Heart, Utensils, ClipboardList, Loader2, Send, Award } from 'lucide-react';
import useStore from '../store/useStore';
import { messService } from '../services/messService';
import { reviewService } from '../services/reviewService';
import { favouriteService } from '../services/favouriteService';

const MessDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useStore();
  const [mess, setMess] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [messData, menuData, reviewData] = await Promise.all([
          messService.getById(id),
          messService.getMenu(id),
          reviewService.getMessReviews(id),
        ]);
        setMess(messData);
        setMenu(menuData);
        setReviews(reviewData);

        if (isAuthenticated && user?.role === 'student') {
          const [favCheck, revCheck] = await Promise.allSettled([
            favouriteService.check(id),
            reviewService.hasReviewed(id),
          ]);
          if (favCheck.status === 'fulfilled') setIsFav(favCheck.value);
          if (revCheck.status === 'fulfilled') setHasReviewed(revCheck.value);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id, isAuthenticated]);

  const toggleFav = async () => {
    if (!isAuthenticated) return;
    try {
      if (isFav) { await favouriteService.remove(id); setIsFav(false); }
      else { await favouriteService.add(id); setIsFav(true); }
    } catch (e) { console.error(e); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewMsg('');
    try {
      const newReview = await reviewService.addReview(id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment || null,
      });
      setReviews([newReview, ...reviews]);
      setHasReviewed(true);
      setReviewMsg('Review submitted successfully!');
      // Refresh mess to get updated avg_rating
      const updated = await messService.getById(id);
      setMess(updated);
    } catch (e) {
      setReviewMsg(e.response?.data?.detail || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }
  if (!mess) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20"><p className="text-slate-500 font-medium">Mess not found</p></div>;
  }

  const mealTypes = [...new Set(menu.map(m => m.meal_type))];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">{mess.name}</motion.h1>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-orange-500" /> {mess.address}, {mess.city}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-current" /> {Number(mess.avg_rating).toFixed(1)} ({mess.total_reviews} reviews)</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded">{mess.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                </div>
              </div>
              {isAuthenticated && user?.role === 'student' && (
                <button onClick={toggleFav}
                  className={`p-3 rounded-2xl border transition-all ${isFav ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200'}`}>
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {mess.description && <p className="text-lg text-slate-500 leading-relaxed mb-10">{mess.description}</p>}

            {/* Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20">
                  {mess.trust_score ? Number(mess.trust_score).toFixed(1) : '--'}
                </div>
                <div><h3 className="font-bold text-slate-900 text-sm flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-500" /> Trust Score</h3></div>
              </div>
              <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-500/20">
                  {mess.hygiene_score ? Number(mess.hygiene_score).toFixed(1) : '--'}
                </div>
                <div><h3 className="font-bold text-slate-900 text-sm flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Hygiene</h3></div>
              </div>
              <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                  ₹{Number(mess.price_per_meal).toFixed(0)}
                </div>
                <div><h3 className="font-bold text-slate-900 text-sm">Per Meal</h3></div>
              </div>
            </div>

            {/* Menu */}
            {menu.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 rounded-xl"><Utensils className="w-5 h-5 text-white" /></div>
                  <h2 className="text-xl font-bold text-slate-900">Menu ({menu.length} items)</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                  {mealTypes.map(type => (
                    <div key={type}>
                      <div className="bg-slate-50 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{type}</div>
                      {menu.filter(m => m.meal_type === type).map(item => (
                        <div key={item.id} className="px-6 py-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                          <div>
                            <span className="font-bold text-slate-900">{item.name}</span>
                            {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {item.price && <span className="font-bold text-slate-700">₹{Number(item.price).toFixed(0)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-900 rounded-xl"><ClipboardList className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-bold text-slate-900">Reviews ({reviews.length})</h2>
              </div>

              {/* Review Form */}
              {isAuthenticated && user?.role === 'student' && !hasReviewed && (
                <form onSubmit={submitReview} className="bg-white p-6 rounded-3xl border border-slate-100 mb-6">
                  <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-slate-500 mr-2">Rating:</span>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                        <Star className={`w-6 h-6 transition-colors ${r <= reviewForm.rating ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none h-24 outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  {reviewMsg && <p className={`text-sm mt-2 font-medium ${reviewMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{reviewMsg}</p>}
                  <button type="submit" disabled={submitting}
                    className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-70">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Review
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-5 rounded-3xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                          {(rev.student_name || 'A')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{rev.student_name || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-sm text-slate-600 font-medium">{rev.comment}</p>}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
                    <p className="text-slate-400 font-medium">No reviews yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sticky Info Card */}
          <div className="w-full lg:w-80">
            <div className="sticky top-28 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Per Meal</span>
                <span className="text-3xl font-black text-orange-500">₹{Number(mess.price_per_meal).toFixed(0)}</span>
              </div>
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Breakfast</span>
                  <span className="font-bold text-slate-900">{mess.serves_breakfast ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Lunch</span>
                  <span className="font-bold text-slate-900">{mess.serves_lunch ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Dinner</span>
                  <span className="font-bold text-slate-900">{mess.serves_dinner ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">FSSAI Verified</span>
                  <span className="font-bold">{mess.is_fssai_verified ? <span className="text-emerald-500">✅ Yes</span> : <span className="text-slate-400">No</span>}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest leading-relaxed">
                TrustBite ensures all scores are verified.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDetailPage;
