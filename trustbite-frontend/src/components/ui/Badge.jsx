import React from 'react';
import { cn } from '../../lib/utils';

export default function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-500 text-white',
    accent: 'bg-orange-500/10 text-orange-600 border border-orange-100'
  };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm', variants[variant], className)}>
      {children}
    </span>
  );
}
