import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, Trash2 } from 'lucide-react';
import MessCard from '../components/MessCard';
import { favouriteService } from '../services/favouriteService';

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await favouriteService.getAll();
        setFavourites(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const removeFav = async (messId) => {
    try {
      await favouriteService.remove(messId);
      setFavourites(f => f.filter(fav => fav.mess_id !== messId));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
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
                <button onClick={() => removeFav(fav.mess_id)}
                  className="absolute top-3 right-3 z-30 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover/fav:opacity-100 transition-opacity shadow-lg hover:bg-red-600">
                  <Trash2 className="w-4 h-4" />
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
