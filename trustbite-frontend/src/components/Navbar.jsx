import React from 'react';
import { Search, MapPin, User, LogOut, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useStore();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-brand flex items-center gap-1 group">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform">
                TB
              </div>
              <span>Trust<span className="text-neutral-900">Bite</span></span>
            </Link>
          </div>

          {/* Location & Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl px-8">
            <div className="flex w-full items-center bg-white border border-neutral-200 rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
                <MapPin className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium text-neutral-700">Shirpur</span>
              </div>
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search for messes or food type..." 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-neutral-800 placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-brand transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-all transform hover:scale-105 active:scale-95">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 text-neutral-500 hover:text-brand transition-colors relative">
                  <Heart className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full border-2 border-white"></span>
                </Link>
                <div className="h-8 w-px bg-neutral-200"></div>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold border border-neutral-200 overflow-hidden group-hover:border-brand transition-colors">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700 group-hover:text-brand transition-colors">
                    {user?.name || 'User'}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-neutral-500 hover:text-brand transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
