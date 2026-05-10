import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Eye, EyeOff, Loader2,
  ShieldCheck, Star, Users, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

// ─── Floating mess preview cards data ────────────────────────────────────
const PREVIEW_MESSES = [
  { name: 'Shree Sai Mess',        emoji: '🍛', trust: 9.2, rating: 4.7, tag: 'Top Rated',  tagColor: '#F97316' },
  { name: 'Annapoorna Bhojanalay', emoji: '🥘', trust: 8.8, rating: 4.5, tag: 'Budget Pick', tagColor: '#8B5CF6' },
  { name: 'Punjabi Dhaba Express', emoji: '🫓', trust: 9.5, rating: 4.9, tag: 'Verified',    tagColor: '#22C55E' },
];

const STATS = [
  { value: '2,400+', label: 'Messes Listed' },
  { value: '18K+',   label: 'Students' },
  { value: '9.1',    label: 'Avg Trust' },
];

const DEMO_CREDS = [
  { role: 'Student',    emoji: '🎓', email: 'aryan@student.com',   pass: 'Student@123', color: '#3B82F6', bg: '#EFF6FF' },
  { role: 'Mess Owner', emoji: '🍽️', email: 'ramesh@owner.com',    pass: 'Owner@123',   color: '#F97316', bg: '#FFF7ED' },
  { role: 'Admin',      emoji: '⚙️', email: 'admin@trustbite.com', pass: 'Admin@123',   color: '#8B5CF6', bg: '#FAF5FF' },
];

// ─── Motion variants ──────────────────────────────────────────────────────
const fadeUp  = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ═════════════════════════════════════════════════════════════════════════
const LoginPage = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [activeCred, setActiveCred]     = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  const { login, authLoading, authError, clearAuthError } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (authLoading) return;
    clearAuthError();
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name}!`);
      if (user.role === 'admin')           navigate('/admin/dashboard');
      else if (user.role === 'mess_owner') navigate('/owner/dashboard');
      else                                 navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    }
  };

  const fillCred = (cred) => {
    setEmail(cred.email);
    setPassword(cred.pass);
    setActiveCred(cred.role);
    clearAuthError();
  };

  const inputStyle = (focused, hasValue) => ({
    width: '100%',
    paddingLeft: 42, paddingRight: 16,
    paddingTop: 13, paddingBottom: 13,
    background: '#fff',
    border: `1.5px solid ${focused || hasValue ? '#F97316' : '#E2E8F0'}`,
    borderRadius: 12,
    fontSize: 14, fontWeight: 500,
    color: '#0F172A', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(249,115,22,0.1)' : 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ══════════════════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '46%',
          background: 'linear-gradient(145deg, #0F172A 0%, #1A2F4E 48%, #0D1F3C 100%)',
          padding: '44px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Ambient glow orbs */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:320, height:320, background:'radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'10%', width:260, height:260, background:'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)', pointerEvents:'none' }} />
        {/* Grid pattern */}
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize:'52px 52px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#F97316,#FBBF24)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(249,115,22,0.35)' }}>
              <span style={{ color:'#fff', fontWeight:900, fontSize:13, fontFamily:'monospace' }}>TB</span>
            </div>
            <span style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Trust<span style={{ color:'#F97316' }}>Bite</span>
            </span>
          </Link>
        </div>

        {/* Hero content */}
        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingTop:48, paddingBottom:48 }}>

          <motion.div variants={fadeUp} style={{ marginBottom:12 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700, color:'#FB923C', letterSpacing:'0.8px', textTransform:'uppercase' }}>
              <ShieldCheck size={11} />
              India's First Mess Trust Platform
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize:'clamp(26px,3.2vw,40px)', fontWeight:900, lineHeight:1.12, color:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:14 }}>
            Find Messes You Can{' '}
            <span style={{ background:'linear-gradient(135deg,#F97316,#FBBF24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Actually Trust
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:360, marginBottom:36 }}>
            Hygiene scores, student reviews, and FSSAI-verified data — all in one place for students across India.
          </motion.p>

          {/* Floating mess preview cards */}
          <motion.div variants={stagger} style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {PREVIEW_MESSES.map((m, i) => (
              <motion.div
                key={m.name}
                variants={fadeUp}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  background:'rgba(255,255,255,0.07)',
                  backdropFilter:'blur(16px)',
                  border:'1px solid rgba(255,255,255,0.11)',
                  borderRadius:14, padding:'11px 14px',
                  marginLeft: i === 1 ? 28 : 0,
                }}
              >
                <div style={{ width:42, height:42, borderRadius:10, background:'rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {m.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Star size={10} style={{ color:'#FBBF24', fill:'#FBBF24' }} />
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:600 }}>{m.rating}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>·</span>
                    <span style={{ fontSize:11, fontWeight:800, color:'#4ADE80', fontFamily:'monospace' }}>H:{m.trust}</span>
                  </div>
                </div>
                <span style={{ fontSize:10, fontWeight:800, color:m.tagColor, background:`${m.tagColor}22`, border:`1px solid ${m.tagColor}40`, padding:'3px 8px', borderRadius:20, flexShrink:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  {m.tag}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.9, duration:0.5 }}
          style={{ position:'relative', zIndex:1, display:'flex', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:22 }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{ flex:1, textAlign:'center', borderRight: i < STATS.length-1 ? '1px solid rgba(255,255,255,0.08)' : 'none', padding:'0 12px' }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#F97316', fontFamily:'monospace', marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — Login form
      ══════════════════════════════════════════════════ */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        background:'#FAFAF9', padding:'44px clamp(20px,6vw,68px)',
        overflowY:'auto', minHeight:'100vh',
      }}>
        <motion.div
          initial={{ opacity:0, y:28 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1], delay:0.12 }}
          style={{ maxWidth:420, width:'100%', margin:'0 auto' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign:'center', marginBottom:28 }}>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
              <div style={{ width:38, height:38, borderRadius:9, background:'linear-gradient(135deg,#F97316,#FBBF24)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'#fff', fontWeight:900, fontSize:12, fontFamily:'monospace' }}>TB</span>
              </div>
              <span style={{ fontSize:20, fontWeight:900, color:'#0F172A', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                Trust<span style={{ color:'#F97316' }}>Bite</span>
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:28, fontWeight:900, color:'#0F172A', lineHeight:1.2, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize:14, color:'#64748B', fontWeight:500 }}>
              Sign in to continue discovering trusted messes
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity:0, y:-8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }}
                style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'11px 14px', fontSize:13, fontWeight:500, color:'#DC2626', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}
              >
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', flexShrink:0 }} />
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Email field */}
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94A3B8', letterSpacing:'0.9px', textTransform:'uppercase', marginBottom:7 }}>
                  Email Address
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: emailFocused || email ? '#F97316' : '#94A3B8', transition:'color 0.2s' }} />
                  <input
                    type="email" value={email} required
                    onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="name@university.edu"
                    style={{ ...inputStyle(emailFocused, !!email) }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:'#94A3B8', letterSpacing:'0.9px', textTransform:'uppercase' }}>
                    Password
                  </label>
                  <button type="button" style={{ fontSize:12, fontWeight:700, color:'#F97316', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position:'relative' }}>
                  <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: passFocused || password ? '#F97316' : '#94A3B8', transition:'color 0.2s' }} />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} required
                    onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="Enter your password"
                    style={{ ...inputStyle(passFocused, !!password), paddingRight: 46 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', padding:0, display:'flex' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + live indicator */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
                  <div style={{ width:17, height:17, borderRadius:4, border:`2px solid ${rememberMe ? '#F97316' : '#CBD5E1'}`, background: rememberMe ? '#F97316' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', flexShrink:0 }}>
                    {rememberMe && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize:13, fontWeight:500, color:'#64748B' }}>Remember me</span>
                </label>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', animation:'pulse-green 2s ease-in-out infinite' }} />
                  <span style={{ fontSize:11, fontWeight:600, color:'#22C55E' }}>FSSAI Data Live</span>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={authLoading}
                whileHover={{ scale: authLoading ? 1 : 1.01 }}
                whileTap={{ scale: authLoading ? 1 : 0.98 }}
                style={{
                  width:'100%', padding:'14px 24px',
                  background: authLoading ? '#FDBA74' : 'linear-gradient(135deg,#F97316 0%,#EA580C 100%)',
                  color:'#fff', border:'none', borderRadius:12,
                  fontSize:15, fontWeight:700, cursor: authLoading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 4px 20px rgba(249,115,22,0.32)',
                  transition:'background 0.2s',
                  fontFamily:"'DM Sans',sans-serif",
                }}
              >
                {authLoading
                  ? <><Loader2 size={17} className="animate-spin" /> Signing you in...</>
                  : <>Sign In <ArrowRight size={17} /></>
                }
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'22px 0' }}>
            <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
            <span style={{ fontSize:12, color:'#94A3B8', fontWeight:500, whiteSpace:'nowrap' }}>try a demo account</span>
            <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
          </div>

          {/* Demo credential selectors */}
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:24 }}>
            {DEMO_CREDS.map((cred) => (
              <motion.button
                key={cred.role}
                type="button"
                onClick={() => fillCred(cred)}
                whileHover={{ scale:1.01, x:3 }}
                whileTap={{ scale:0.99 }}
                style={{
                  display:'flex', alignItems:'center', gap:11, padding:'10px 13px',
                  background: activeCred === cred.role ? cred.bg : '#fff',
                  border: `1.5px solid ${activeCred === cred.role ? cred.color : '#E2E8F0'}`,
                  borderRadius:11, cursor:'pointer', textAlign:'left',
                  transition:'all 0.15s',
                  boxShadow: activeCred === cred.role ? `0 0 0 3px ${cred.color}18` : 'none',
                }}
              >
                <div style={{ width:32, height:32, borderRadius:8, background:cred.bg, border:`1px solid ${cred.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                  {cred.emoji}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:cred.color, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:1 }}>{cred.role}</div>
                  <div style={{ fontSize:11, color:'#64748B', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cred.email}</div>
                </div>
                <AnimatePresence>
                  {activeCred === cred.role && (
                    <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                      style={{ width:18, height:18, borderRadius:'50%', background:cred.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ChevronRight size={13} style={{ color:'#CBD5E1', flexShrink:0 }} />
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <span style={{ fontSize:13, color:'#94A3B8', fontWeight:500 }}>New to TrustBite? </span>
            <Link to="/register" style={{ fontSize:13, fontWeight:700, color:'#F97316', textDecoration:'none' }}>
              Create account →
            </Link>
          </div>

          {/* Security note */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <ShieldCheck size={11} style={{ color:'#CBD5E1' }} />
            <span style={{ fontSize:11, color:'#CBD5E1' }}>
              256-bit encrypted · FSSAI verified · Zero ads
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default LoginPage;