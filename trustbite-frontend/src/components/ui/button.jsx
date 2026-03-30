import React from 'react';
import { cn } from '../../lib/utils';

export default function Button({ children, className, variant = 'primary', size = 'md', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange hover:scale-105 active:scale-95',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 active:scale-95',
    outline: 'border-2 border-white/10 text-white hover:bg-white/5 active:scale-95',
    ghost: 'text-slate-600 hover:text-slate-900 transition-colors'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold'
  };

  return (
    <button 
      className={cn(
        'rounded-full transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
