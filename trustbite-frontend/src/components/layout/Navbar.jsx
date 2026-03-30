import { motion } from 'framer-motion';
import { useScrolled } from '../../hooks/useScrolled';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

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
            {['Discover', 'How It Works', 'Trust Scores', 'About'].map(item => (
              <a key={item} href='#'
                className={`text-sm font-bold tracking-tight transition-all duration-300 hover:scale-105 ${
                  scrolled 
                    ? 'text-slate-600 hover:text-orange-500' 
                    : 'text-white/90 hover:text-white'
                }`}
              >{item}</a>
            ))}
          </div>

          {/* CTA Group */}
          <div className='hidden md:flex items-center gap-4'>
            <button className={`text-sm font-bold transition-all duration-300 hover:opacity-80 active:scale-95 ${ 
              scrolled ? 'text-slate-900' : 'text-white' 
            }`}>
              Sign In
            </button>
            <Link to='/discover' className={`text-sm font-black px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
              scrolled
                ? 'bg-orange-500 text-white shadow-orange-500/20 hover:shadow-orange-500/40'
                : 'bg-black text-white shadow-black/20 hover:shadow-black/40'
            }`}>
              Find a Mess
            </Link>
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
          className='md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-xl'>
          {['Discover', 'How It Works', 'Trust Scores', 'About'].map(item => (
            <a key={item} href='#' className='text-slate-700 font-bold py-1 hover:text-orange-500 transition-colors'>{item}</a>
          ))}
          <Link to='/discover' className='bg-orange-500 text-white font-bold px-5 py-3 rounded-full text-center shadow-lg shadow-orange-500/20 active:scale-95 transition-transform'>Find a Mess</Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
