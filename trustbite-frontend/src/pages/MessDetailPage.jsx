import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Info, ArrowLeft, Heart, Share2, ClipboardList, Utensils, Award } from 'lucide-react';
import useStore from '../store/useStore';

const MessDetailPage = () => {
  const { id } = useParams();
  const { favourites, toggleFavourite } = useStore();
  const isFavourite = favourites.includes(parseInt(id));

  // Dummy Detail Data
  const mess = {
    id: parseInt(id),
    name: "Annapurna Mess",
    avg_rating: 4.8,
    total_reviews: 156,
    city: "R.C. Patel Campus, Shirpur",
    monthly_price: 3200,
    food_type: "veg",
    trust_score: 98,
    hygiene_score: 4.5,
    description: "Premium quality home-style vegetarian meals served with love. We prioritize cleanliness and consistent taste since 2012.",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
    ],
    menu: [
      { day: "Monday", breakfast: "Poha", lunch: "Dal, Baati, Churma", dinner: "Paneer Masala, Roti" },
      { day: "Tuesday", breakfast: "Upma", lunch: "Mix Veg, Dal, Rice", dinner: "Sev Bhaji, Jowar Bhakar" },
      { day: "Wednesday", breakfast: "Paratha", lunch: "Chole Bhature", dinner: "Baingan Bharta, Roti" },
      { day: "Thursday", breakfast: "Medu Vada", lunch: "Kadhi Khichdi", dinner: "Aloo Gobhi, Roti" },
      { day: "Friday", breakfast: "Misal Pav", lunch: "Veg Pulao, Raita", dinner: "Matar Paneer, Roti" },
      { day: "Saturday", breakfast: "Idli", lunch: "Maharashtrian Thali", dinner: "Shev Bhaji, Roti" },
      { day: "Sunday", breakfast: "Puri Bhaji", lunch: "Special Thali", dinner: "Light Dinner/Khichdi" }
    ],
    reviews: [
      { id: 1, user: "Rahul S.", rating: 5, comment: "Best mess for students! Very clean and food feels like home.", date: "2 days ago" },
      { id: 2, user: "Sneha P.", rating: 4, comment: "Love the Sunday specials. Hygiene is definitely 5/5.", date: "1 week ago" }
    ]
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Top Bar / Images */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/discovery" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-brand transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Discovery
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[40px] overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden group">
              <img src={mess.images[0]} alt={mess.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden group">
                <img src={mess.images[1]} alt={mess.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <div className="aspect-square overflow-hidden group">
                <img src={mess.images[2]} alt={mess.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 mb-4">{mess.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-neutral-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand" />
                    {mess.city}
                  </div>
                  <div className="w-1.5 h-1.5 bg-neutral-200 rounded-full"></div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {mess.avg_rating} ({mess.total_reviews} reviews)
                  </div>
                  <div className="w-1.5 h-1.5 bg-neutral-200 rounded-full"></div>
                  <div className="uppercase tracking-widest text-[10px] font-bold border border-neutral-200 px-2 py-0.5 rounded">
                    {mess.food_type}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="p-3 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:bg-neutral-50 transition-colors">
                  <Share2 className="w-5 h-5 text-neutral-600" />
                </button>
                <button 
                  onClick={() => toggleFavourite(mess.id)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isFavourite ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' : 'bg-white border-neutral-100 text-neutral-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavourite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-lg text-neutral-500 leading-relaxed mb-12">
              {mess.description}
            </p>

            {/* Scores Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
              <div className="bg-trust-light p-6 rounded-3xl border border-trust/10 flex items-center gap-6 group hover:border-trust/30 transition-colors">
                <div className="w-16 h-16 bg-trust rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-trust/20 group-hover:scale-110 transition-transform">
                  {mess.trust_score}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-trust" />
                    Trust Score
                  </h3>
                  <p className="text-sm text-neutral-500">Based on consistency & longevity</p>
                </div>
              </div>
              <div className="bg-brand-light p-6 rounded-3xl border border-brand/10 flex items-center gap-6 group hover:border-brand/30 transition-colors">
                <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
                  {mess.hygiene_score}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    Hygiene Score
                  </h3>
                  <p className="text-sm text-neutral-500">Verified by local audits</p>
                </div>
              </div>
            </div>

            {/* Weekly Menu Table */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-neutral-900 rounded-xl">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Weekly Menu</h2>
              </div>
              <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest text-center">Day</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Breakfast</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Lunch</th>
                      <th className="px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Dinner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {mess.menu.map((m, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-5 text-sm font-bold text-neutral-900 text-center">{m.day}</td>
                        <td className="px-6 py-5 text-sm text-neutral-500 font-medium">{m.breakfast}</td>
                        <td className="px-6 py-5 text-sm text-neutral-500 font-medium">{m.lunch}</td>
                        <td className="px-6 py-5 text-sm text-neutral-500 font-medium">{m.dinner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-neutral-900 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">Student Reviews</h2>
                </div>
                <button className="text-brand font-bold text-sm">See all reviews</button>
              </div>
              <div className="space-y-6">
                {mess.reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-6 rounded-3xl border border-neutral-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500">
                          {rev.user[0]}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{rev.user}</p>
                          <p className="text-xs text-neutral-400 font-medium">{rev.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-yellow-500 fill-current' : 'text-neutral-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-600 font-medium leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Booking/Price Card */}
          <div className="w-full lg:w-96">
            <div className="sticky top-28 bg-white p-8 rounded-[40px] border border-neutral-100 shadow-premium">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Monthly Subscription</span>
                <span className="text-3xl font-black text-brand">₹{mess.monthly_price}</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm py-3 border-b border-neutral-50">
                  <span className="text-neutral-500 font-medium">Daily Meals</span>
                  <span className="text-neutral-900 font-bold">Breakfast, Lunch, Dinner</span>
                </div>
                <div className="flex items-center justify-between text-sm py-3 border-b border-neutral-50">
                  <span className="text-neutral-500 font-medium">Sunday Specials</span>
                  <span className="text-neutral-900 font-bold">Yes (Full Meal)</span>
                </div>
                <div className="flex items-center justify-between text-sm py-3">
                  <span className="text-neutral-500 font-medium">Home Delivery</span>
                  <span className="text-neutral-900 font-bold text-brand">Not Available</span>
                </div>
              </div>

              <button className="w-full bg-neutral-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all transform active:scale-95 mb-4 shadow-xl shadow-neutral-200">
                Contact Owner
              </button>
              <button className="w-full bg-white border-2 border-neutral-100 text-neutral-900 py-5 rounded-2xl font-bold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
                <Info className="w-5 h-5" />
                Inquiry Details
              </button>
              
              <p className="text-[10px] text-neutral-400 text-center mt-6 uppercase font-bold tracking-widest leading-relaxed px-4">
                TrustBite ensures all scores are verified. Use of this platform implies agreement with student guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDetailPage;
