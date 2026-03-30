import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[16/10] bg-neutral-200"></div>
      <div className="p-4 space-y-4 flex-1">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-neutral-200 rounded-md w-3/4"></div>
          <div className="h-6 bg-neutral-200 rounded-md w-12"></div>
        </div>
        <div className="h-4 bg-neutral-100 rounded-md w-1/2"></div>
        <div className="mt-auto pt-3 border-t border-neutral-50 flex justify-between">
          <div className="h-4 bg-neutral-100 rounded-md w-16"></div>
          <div className="h-4 bg-neutral-100 rounded-md w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
