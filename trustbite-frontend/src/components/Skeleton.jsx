import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

export const MessCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full shadow-sm">
    <Skeleton className="aspect-[16/10] rounded-none" />
    <div className="p-4 flex flex-col flex-1 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);
