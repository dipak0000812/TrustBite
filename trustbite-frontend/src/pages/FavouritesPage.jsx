import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import MessCard from '../components/MessCard';
import { MessCardSkeleton } from '../components/Skeleton';
import { favouriteService } from '../services/favouriteService';

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await favouriteService.getAll();
        if (mounted) setFavourites(data);
      } catch (e) { console.error(e); }
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const removeFav = async (messId) => {
    if (removingId) return;
    setRemovingId(messId);
    try {
      await favouriteService.remove(messId);
      setFavourites(f => f.filter(fav => fav.mess_id !== messId));
      toast.success('Removed from favourites');
    } catch (e) { 
      toast.error('Failed to remove favourite');
      console.error(e); 
    }
    finally { setRemovingId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-xl" />
            <div className="w-48 h-8 bg-slate-200 animate-pulse rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <MessCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-orange-50 rounded-xl"><Heart className="w-6 h-6 text-orange-500 fill-current" /></div>
            <h1 className="text-3xl font-black text-slate-900">My Favourites</h1>
            <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-sm font-bold">{favourites.length}</span>
          </div>
        </motion.div>

        {favourites.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favourites.map((fav, i) => fav.mess && (
              <motion.div key={fav.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="relative group/fav">
                <MessCard mess={fav.mess} />
                <button onClick={() => removeFav(fav.mess_id)} disabled={removingId === fav.mess_id}
                  className={`absolute top-3 right-3 z-30 p-2 bg-red-500 text-white rounded-full transition-opacity shadow-lg hover:bg-red-600 ${removingId === fav.mess_id ? 'opacity-70 cursor-not-allowed' : 'opacity-0 group-hover/fav:opacity-100'}`}>
                  {removingId === fav.mess_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No favourites yet</h3>
            <p className="text-slate-500 mb-8">Discover messes and heart the ones you love!</p>
            <Link to="/discover" className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors">
              Discover Messes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesPage;
