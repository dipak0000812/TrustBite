/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: { deep:'#0F2050', mid:'#1A3A6B', accent:'#F97316' },
        trust: { green:'#22C55E', amber:'#F59E0B', red:'#EF4444' },
      },
      keyframes: {
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        float: { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        float: 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.07)',
        'card-hover': '0 20px 60px rgba(15,32,80,0.16)',
        'orange': '0 8px 32px rgba(249,115,22,0.3)',
      },
    },
  },
  plugins: [],
};
