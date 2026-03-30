import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Ghost } from 'lucide-react';
import useStore from '../store/useStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setUser({ ...formData });
    localStorage.setItem('token', 'fake-jwt-token');
    navigate('/discovery');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50/50 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black text-brand mb-6 inline-block">TB</Link>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-neutral-500 font-medium">Join 5,000+ students finding better meals</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-premium border border-neutral-100">
          <div className="flex p-1 bg-neutral-100 rounded-2xl mb-8">
            <button 
              onClick={() => setFormData({...formData, role: 'student'})}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'student' ? 'bg-white text-brand shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setFormData({...formData, role: 'owner'})}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'owner' ? 'bg-white text-brand shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Mess Owner
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand transition-colors" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/10 text-neutral-800 font-medium transition-all"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand transition-colors" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/10 text-neutral-800 font-medium transition-all"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all transform active:scale-95 shadow-xl shadow-brand/10"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-neutral-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
