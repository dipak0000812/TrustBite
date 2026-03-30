export default function SkeletonLoader() {
  return (
    <div className='bg-white rounded-2xl overflow-hidden animate-pulse' style={{ boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
      <div className='h-48 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]' />
      <div className='p-5 flex flex-col gap-3'>
        <div className='flex justify-between'>
          <div className='h-4 bg-slate-100 rounded-full w-3/5' />
          <div className='h-4 bg-slate-100 rounded-full w-1/5' />
        </div>
        <div className='h-3 bg-slate-100 rounded-full w-2/5' />
        <div className='h-3 bg-slate-100 rounded-full w-1/3' />
        <div className='flex gap-2 mt-1'>
          <div className='h-6 bg-slate-100 rounded-full w-16' />
          <div className='h-6 bg-slate-100 rounded-full w-20' />
        </div>
      </div>
    </div>
  );
}
