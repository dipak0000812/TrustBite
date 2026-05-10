import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, authLoading, authError, clearAuthError } = useStore();
  const navigate = useNavigate();

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-amber-500' };
    return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = passwordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (authLoading) return;
    setValidationError('');
    clearAuthError();

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      const user = await register(formData);
      toast.success(`Welcome, ${user.full_name}! Account created.`);
      
      // Role-based redirect
      if (user.role === 'mess_owner') {
        navigate('/owner/onboarding');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const update = (key, val) => setFormData({ ...formData, [key]: val });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 py-16 relative overflow-hidden">
      <div className="absolute top-40 right-20 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-200/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-sm font-mono">TB</span>
            </div>
            <span className="font-display font-black text-2xl text-slate-900">Trust<span className="text-orange-500">Bite</span></span>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-slate-500 font-medium">Join thousands of students finding better meals</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white/60">
          {/* Role Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => update('role', 'student')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'student' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => update('role', 'mess_owner')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'mess_owner' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🍽️ Mess Owner
            </button>
          </div>

          {(authError || validationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl mb-6"
            >
              {validationError || authError}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Aryan Mehta"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 text-slate-800 font-medium transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 text-slate-800 font-medium transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 text-slate-800 font-medium transition-all outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 text-slate-800 font-medium transition-all outline-none"
                  required
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {authLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
