import { Link } from 'react-router-dom';
import { Shield, Instagram, Twitter, Linkedin, Github } from 'lucide-react';

const LINKS = {
  Product: ['Discover Messes', 'Trust Scores', 'AI Suggestions', 'For Mess Owners'],
  Company: ['About Us', 'Blog', 'Press Kit', 'Careers'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer style={{ background: '#0A1628' }}>
      {/* Main footer */}
      <div className='max-w-7xl mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-10'>
        {/* Brand */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center'>
              <span className='text-white font-bold text-xs font-mono'>TB</span>
            </div>
            <span className='text-white font-bold text-xl font-display'>Trust<span className='text-orange-400'>Bite</span></span>
          </div>
          <p className='text-white/40 text-sm leading-relaxed mb-6'>India&apos;s first hyperlocal mess discovery platform — built for students, powered by trust.</p>
          <div className='flex gap-3'>
            {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href='#' className='w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/50 hover:bg-orange-500 hover:text-white transition-all duration-200'>
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([cat, links]) => (
          <div key={cat}>
            <h4 className='text-white font-semibold text-sm mb-4'>{cat}</h4>
            <ul className='flex flex-col gap-3'>
              {links.map(l => <li key={l}><a href='#' className='text-white/40 text-sm hover:text-orange-400 transition-colors'>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className='border-t border-white/10 py-6 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2'>
        <p className='text-white/30 text-xs'>&copy; {new Date().getFullYear()} TrustBite Technologies. All rights reserved.</p>
        <p className='text-white/20 text-xs'>Made with ❤️ for students across India</p>
      </div>
    </footer>
  );
}
