export default function TrustScoreBadge({ score, size = 'md' }) {
  const r = 18, circ = 2 * Math.PI * r;
  const pct = score / 10;
  const color = score >= 8 ? '#22C55E' : score >= 6 ? '#F59E0B' : '#EF4444';
  const dim = size === 'sm' ? 48 : size === 'lg' ? 80 : 64;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 18 : 13;

  return (
    <div className='relative inline-flex items-center justify-center bg-white rounded-xl shadow-md'
      style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} viewBox='0 0 48 48' className='absolute inset-0 -rotate-90'>
        <circle cx='24' cy='24' r={r} fill='none' stroke='#F1F5F9' strokeWidth='3' />
        <circle cx='24' cy='24' r={r} fill='none' stroke={color} strokeWidth='3'
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap='round'
        />
      </svg>
      <div className='relative z-10 flex flex-col items-center leading-none'>
        <span style={{ fontSize, color, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{score}</span>
        {size !== 'sm' && <span style={{ fontSize: 7, color: '#94A3B8', fontWeight: 600 }}>HYGIENE</span>}
      </div>
    </div>
  );
}
