import { motion } from 'framer-motion';
import { useScrolled } from '../../hooks/useScrolled';
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Heart, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';

export default function Navbar() {
  const scrolled = useScrolled();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, isInitializing } = useStore();
  const navigate = useNavigate();
  const dropRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isInitializing) return null;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 lg:h-20'>

          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 group'>
            <div className='w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20'>
              <span className='text-white font-bold text-sm font-mono'>TB</span>
            </div>
            <span className={`font-display font-black text-xl tracking-tight transition-colors duration-300 ${ scrolled ? 'text-slate-900' : 'text-white' }`}>
              Trust<span className={scrolled ? 'text-orange-500' : 'text-white/80'}>Bite</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className='hidden md:flex items-center gap-8'>
            {[
              { label: 'Discover', to: '/discover' },
              { label: 'How It Works', to: '/#how-it-works' },
            ].map(item => (
              <Link key={item.label} to={item.to}
                className={`text-sm font-bold tracking-tight transition-all duration-300 hover:scale-105 ${
                  scrolled
                    ? 'text-slate-600 hover:text-orange-500'
                    : 'text-white/90 hover:text-white'
                }`}
              >{item.label}</Link>
            ))}
          </div>

          {/* New Heart/User Link Group */}
          <div className="hidden md:flex items-center">
            {user?.role === 'student' ? (
              <Link
                to="/favourites"
                className={`p-2 transition-colors relative ${scrolled ? 'text-slate-500 hover:text-orange-500' : 'text-white/80 hover:text-white'}`}
              >
                <Heart className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
              </Link>
            ) : (
              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'mess_owner' ? '/owner/dashboard' : '/student/dashboard'}
                className={`p-2 transition-colors ${scrolled ? 'text-slate-500 hover:text-orange-500' : 'text-white/80 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* CTA Group */}
          <div className='hidden md:flex items-center gap-4'>
            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 px-3 py-2 rounded-full ${
                    scrolled ? 'text-slate-700 hover:bg-slate-50' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.full_name || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="font-bold text-slate-900 text-sm truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{user?.role}</span>
                    </div>
                    <Link to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'mess_owner' ? '/owner/dashboard' : '/student/dashboard'} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" /> {user?.role === 'mess_owner' ? 'Owner Dashboard' : user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
                    </Link>
                    {user?.role === 'student' && (
                      <Link to="/favourites" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Heart className="w-4 h-4 text-slate-400" /> Favourites
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4 text-slate-400" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-bold transition-all duration-300 hover:opacity-80 active:scale-95 ${
                  scrolled ? 'text-slate-900' : 'text-white'
                }`}>Sign In</Link>
                <Link to='/discover' className={`text-sm font-black px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                  scrolled
                    ? 'bg-orange-500 text-white shadow-orange-500/20 hover:shadow-orange-500/40'
                    : 'bg-black text-white shadow-black/20 hover:shadow-black/40'
                }`}>Find a Mess</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`} onClick={() => setOpen(!open)}>
            {open ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className='md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex flex-col gap-3 shadow-xl'>
          <Link to='/discover' onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2 hover:text-orange-500 transition-colors'>Discover</Link>
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'mess_owner' ? '/owner/dashboard' : '/student/dashboard'} onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2 hover:text-orange-500'>
                {user?.role === 'mess_owner' ? 'Owner Dashboard' : user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
              </Link>
              {user?.role === 'student' && <Link to='/favourites' onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2'>Favourites</Link>}
              {user?.role === 'admin' && <Link to='/admin/dashboard' onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2 hover:text-orange-500'>Admin Panel</Link>}
              {user?.role === 'mess_owner' && <Link to='/owner/onboarding' onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2'>Manage Mess</Link>}
              <button onClick={() => { handleLogout(); setOpen(false); }} className='text-red-500 font-bold py-2 text-left'>Log Out</button>
            </>
          ) : (
            <>
              <Link to='/login' onClick={() => setOpen(false)} className='text-slate-700 font-bold py-2'>Sign In</Link>
              <Link to='/register' onClick={() => setOpen(false)} className='bg-orange-500 text-white font-bold px-5 py-3 rounded-full text-center shadow-lg shadow-orange-500/20'>Get Started</Link>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
