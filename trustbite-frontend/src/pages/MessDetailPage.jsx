import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin, ArrowLeft, Heart, Utensils, ClipboardList, Loader2, Send, Award, PhoneCall, MessageCircle, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { messService } from '../services/messService';
import { reviewService } from '../services/reviewService';
import { favouriteService } from '../services/favouriteService';
import { Skeleton, ReviewSkeleton } from '../components/Skeleton';

const MessDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useStore();
  const [mess, setMess] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const navigate = useNavigate();

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, hygiene_rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) setLoading(true);
      try {
        const [messData, menuData, reviewData] = await Promise.all([
          messService.getById(id),
          messService.getMenu(id),
          reviewService.getMessReviews(id),
        ]);
        if (mounted) {
          console.log("LATEST MESS DATA FETCHED:", messData);
          setMess(messData);
          setMenu(menuData);
          setReviews(reviewData);
        }

        if (isAuthenticated && user?.role === 'student') {
          const [favCheck, revCheck, allRevs] = await Promise.allSettled([
            favouriteService.check(id),
            reviewService.hasReviewed(id),
            reviewService.getMessReviews(id)
          ]);
          if (mounted) {
            if (favCheck.status === 'fulfilled') setIsFav(favCheck.value);
            if (revCheck.status === 'fulfilled') {
              const hasRev = revCheck.value;
              setHasReviewed(hasRev);
              if (hasRev && allRevs.status === 'fulfilled') {
                const myRev = allRevs.value.find(r => r.student_id === user.id);
                if (myRev) {
                  setReviewForm({
                    rating: myRev.rating,
                    hygiene_rating: myRev.hygiene_rating,
                    comment: myRev.comment || ''
                  });
                }
              }
            }
          }
        }
      } catch (e) { console.error(e); }
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [id, isAuthenticated, user]);

  const toggleFav = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) { 
        await favouriteService.remove(id); 
        setIsFav(false); 
        toast.success('Removed from favourites');
      }
      else { 
        await favouriteService.add(id); 
        setIsFav(true); 
        toast.success('Added to favourites!');
      }
    } catch (e) { 
      toast.error('Failed to update favourites');
      console.error(e); 
    }
    finally { setFavLoading(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (hasReviewed) {
        await reviewService.updateReview(id, {
          rating: reviewForm.rating,
          hygiene_rating: reviewForm.hygiene_rating,
          comment: reviewForm.comment || null,
        });
        toast.success('Review updated successfully!');
      } else {
        await reviewService.addReview(id, {
          rating: reviewForm.rating,
          hygiene_rating: reviewForm.hygiene_rating,
          comment: reviewForm.comment || null,
        });
        toast.success('Review submitted successfully!');
      }
      
      const updatedReviews = await reviewService.getMessReviews(id);
      setReviews(updatedReviews);
      setHasReviewed(true);
      if (!hasReviewed) setReviewForm({ rating: 5, hygiene_rating: 5, comment: '' });
      
      // Refresh mess to get updated avg_rating
      const updated = await messService.getById(id);
      setMess(updated);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const MessDetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="w-40 h-5 mb-8 rounded-lg" />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            {/* Hero Image Skeleton */}
            <Skeleton className="w-full h-[300px] sm:h-[400px] rounded-[32px]" />
            
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-1/2 rounded-lg" />
            </div>

            {/* Trust Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-8 rounded-[32px] border border-slate-100">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>

            {/* Menu Skeleton */}
            <Skeleton className="h-64 rounded-[32px]" />
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-80 space-y-6">
            <Skeleton className="h-[400px] rounded-[32px]" />
            <Skeleton className="h-48 rounded-[32px]" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <MessDetailSkeleton />;
  if (!mess) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20"><p className="text-slate-500 font-medium">Mess not found</p></div>;
  }

  const mealTypes = Array.isArray(menu) ? [...new Set(menu.map(m => m.meal_type || 'General'))] : [];

  const galleryImages = mess.gallery_images ? mess.gallery_images.split(',').map(url => url.trim()).filter(Boolean) : (mess.image_url ? [mess.image_url] : []);
  const heroImage = galleryImages.length > 0 ? galleryImages[0] : null;
  const thumbnails = galleryImages.slice(1, 4);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mess.name}, ${mess.address}, ${mess.city}`)}`;
  const tags = mess.tags ? mess.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left */}
          <div className="flex-1">
            
            {/* Image Gallery */}
            {heroImage ? (
              <div className="mb-8 space-y-3 px-2 sm:px-0">
                <div className="w-full h-[240px] sm:h-[400px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-slate-100 shadow-sm border border-slate-200/50">
                  <img src={heroImage} alt={mess.name} className="w-full h-full object-cover" />
                </div>
                {thumbnails.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {thumbnails.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/50 snap-start">
                        <img src={img} alt={`${mess.name} view ${i+2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
               <div className="mb-8 w-full h-[180px] sm:h-[300px] rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center border border-orange-200 shadow-sm mx-2 sm:mx-0">
                 <span className="text-6xl sm:text-8xl">{mess.is_veg ? '🥗' : '🍛'}</span>
               </div>
            )}

            {/* Header & Tags */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 px-2 sm:px-0">
              <div className="flex-1">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">{mess.name}</motion.h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-slate-500 font-bold text-sm">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
                    <MapPin className="w-4 h-4 text-orange-500" /> 
                    <span className="underline decoration-slate-300 underline-offset-4">{mess.address}, {mess.city}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-current" /> {mess.avg_rating ? Number(mess.avg_rating).toFixed(1) : '0.0'}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 px-2 py-0.5 rounded-lg">{mess.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                  </div>
                </div>
              </div>
              {isAuthenticated && user?.role === 'student' && (
                <button onClick={toggleFav} disabled={favLoading}
                  className={`p-4 rounded-2xl border-2 transition-all w-full sm:w-auto flex items-center justify-center ${isFav ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200'} ${favLoading ? 'opacity-70' : ''}`}>
                  {favLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />}
                  <span className="sm:hidden ml-2 font-bold">{isFav ? 'In Favourites' : 'Add to Favourites'}</span>
                </button>
              )}
            </div>

            {mess.description && <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-10 px-2 sm:px-0">{mess.description}</p>}

            {/* Trust Breakdown */}
            <div className="mb-12 bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-6 sm:p-8 mx-2 sm:mx-0 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" /> Trust Score
                  </h2>
                  <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-wider text-[11px]">How we calculate reliability</p>
                </div>
                <div className="flex w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500 rounded-2xl items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
                  {mess.trust_score ? Number(mess.trust_score).toFixed(1) : '--'}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
                    {mess.avg_rating ? Number(mess.avg_rating).toFixed(1) : '0.0'} <Star className="w-4 h-4 text-amber-500 fill-current" />
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hygiene</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
                    {mess.hygiene_score ? Number(mess.hygiene_score).toFixed(1) : '--'} <ShieldCheck className="w-4 h-4 text-orange-500" />
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reviews</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{mess.total_reviews}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FSSAI</p>
                  {mess.is_fssai_verified ? (
                    <span className="text-emerald-600 text-xs font-black uppercase tracking-wider">Verified ✓</span>
                  ) : (
                    <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Pending</span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu */}
            {Array.isArray(menu) && menu.length > 0 && (
              <div className="mb-12 px-2 sm:px-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 rounded-xl"><Utensils className="w-5 h-5 text-white" /></div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Today&apos;s Menu</h2>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  {Array.isArray(mealTypes) && mealTypes.map(type => (
                    <div key={type}>
                      <div className="bg-slate-50 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{type}</div>
                      {Array.isArray(menu) && menu.filter(m => (m.meal_type || 'General') === type).map(item => (
                        <div key={item.id} className="px-6 py-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                            {item.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>}
                          </div>
                          <div className="flex items-center gap-3 text-sm flex-shrink-0">
                            <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} title={item.is_veg ? 'Veg' : 'Non-Veg'} />
                            {item.price && <span className="font-black text-slate-900">₹{Number(item.price).toFixed(0)}</span>}
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
              {isAuthenticated && user?.role === 'student' && (
                <form onSubmit={submitReview} className="bg-white p-5 sm:p-8 rounded-[32px] border border-slate-100 mb-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 tracking-tight">{hasReviewed ? 'Edit Your Review' : 'Share Your Experience'}</h3>
                    {hasReviewed && <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Already Reviewed</span>}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-16">Overall</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                            <Star className={`w-6 h-6 transition-all ${r <= reviewForm.rating ? 'text-amber-500 fill-current scale-110' : 'text-slate-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-16">Hygiene</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, hygiene_rating: r })}>
                            <ShieldCheck className={`w-6 h-6 transition-all ${r <= reviewForm.hygiene_rating ? 'text-emerald-500 fill-current scale-110' : 'text-slate-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Describe the food, ambience, or service..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-700 placeholder-slate-400 resize-none h-32 outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white transition-all"
                  />
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                    <button type="submit" disabled={submitting}
                      className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200">
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      {hasReviewed ? 'Update Review' : 'Submit Review'}
                    </button>
                    {hasReviewed && (
                      <p className="text-[10px] font-bold text-slate-400 text-center sm:text-left">
                        Updating your review will recalculate the trust score.
                      </p>
                    )}
                  </div>
                </form>
              )}

              {!isAuthenticated && (
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 mb-8 text-center shadow-sm">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Join the Community</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Sign in to rate this mess and add it to your favourites.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    Sign In Now
                  </Link>
                </div>
              )}

              <div className="space-y-4 px-1 sm:px-0">
                {Array.isArray(reviews) && reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden group">
                    {rev.student_id === user?.id && (
                       <div className="absolute top-0 right-0 px-3 py-1 bg-orange-50 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-bl-xl">Your Review</div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xs text-slate-500 shadow-sm">
                          {(rev.student_name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{rev.student_name || 'Anonymous User'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-sm text-slate-600 font-bold leading-relaxed">{rev.comment}</p>}
                    <div className="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Hygiene {rev.hygiene_rating}/5
                       </div>
                    </div>
                  </div>
                ))}
                {Array.isArray(reviews) && reviews.length === 0 && (
                  <div className="bg-white rounded-[32px] p-16 text-center border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Be the first student to share your honest experience with the community!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sticky Info Card */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Subscription Pricing */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Per Meal</span>
                  <span className="text-3xl font-black text-orange-500">₹{Number(mess.price_per_meal).toFixed(0)}</span>
                </div>
                
                {(mess.weekly_price || mess.monthly_price) && (
                  <div className="space-y-3 mb-6 pt-6 border-t border-slate-50">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Subscription Plans</div>
                    {mess.weekly_price && (
                      <div className="flex justify-between items-center py-2.5 bg-slate-50 px-4 rounded-xl">
                        <span className="text-sm font-medium text-slate-600">Weekly</span>
                        <span className="font-bold text-slate-900">₹{Number(mess.weekly_price).toFixed(0)}</span>
                      </div>
                    )}
                    {mess.monthly_price && (
                      <div className="flex justify-between items-center py-2.5 bg-orange-50 px-4 rounded-xl border border-orange-100">
                        <span className="text-sm font-bold text-orange-600">Monthly</span>
                        <span className="font-black text-orange-600 text-lg">₹{Number(mess.monthly_price).toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 mb-8 text-sm pt-6 border-t border-slate-50">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Meal Timings</div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Breakfast</span>
                    <span className="font-bold text-slate-900 text-right">{mess.serves_breakfast ? (mess.breakfast_time || '7:30 AM - 10:00 AM') : '❌'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Lunch</span>
                    <span className="font-bold text-slate-900 text-right">{mess.serves_lunch ? (mess.lunch_time || '12:30 PM - 3:00 PM') : '❌'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Dinner</span>
                    <span className="font-bold text-slate-900 text-right">{mess.serves_dinner ? (mess.dinner_time || '7:30 PM - 10:30 PM') : '❌'}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest leading-relaxed">
                  TrustBite ensures all scores are verified.
                </div>
              </div>

              {/* Owner Info & Contact */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">{(mess.owner_name || 'R')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Managed By</p>
                    <p className="text-sm font-bold text-slate-900">{mess.owner_name || 'Ramesh Patil'}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Serving students since 2018</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${mess.owner_phone || '9999999999'}`} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-100">
                      <PhoneCall className="w-4 h-4" /> Call Owner
                    </a>
                    <a href={`https://wa.me/91${mess.owner_phone || '9999999999'}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl font-bold text-sm transition-colors border border-emerald-100">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  </div>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-bold text-sm transition-colors border border-blue-100 w-full">
                    <MapPin className="w-4 h-4" /> Open Maps
                  </a>
                </div>
              </div>

              {/* Hygiene Safety Badge */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-[32px] border border-emerald-100/50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-900 text-sm">Hygiene & Safety</h3>
                </div>
                <div className="space-y-3">
                  {['RO Water Used', 'Daily Kitchen Cleaning', 'Fresh Ingredients', 'Steel Utensils'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-emerald-800/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDetailPage;
