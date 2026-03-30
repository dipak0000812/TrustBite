import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import useStore from '../store/useStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate API Login
    setUser({ name: 'Dipak Sonawane', email, role: 'student' });
    localStorage.setItem('token', 'fake-jwt-token');
    navigate('/discovery');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand mb-6 inline-block">TB</Link>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-neutral-500 font-medium">Log in to manage your tiffin subscriptions</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-premium border border-neutral-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/10 text-neutral-800 font-medium transition-all"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/10 text-neutral-800 font-medium transition-all"
                  required 
                />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" className="text-xs font-bold text-brand hover:underline">Forgot password?</button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all transform active:scale-95 shadow-xl shadow-brand/10"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-neutral-400">
              <span className="bg-white px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-colors font-bold text-neutral-600">
              <Chrome className="w-5 h-5" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-colors font-bold text-neutral-600">
              <Github className="w-5 h-5" />
              Github
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-neutral-500 font-medium">
          New to TrustBite?{' '}
          <Link to="/register" className="text-brand font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
