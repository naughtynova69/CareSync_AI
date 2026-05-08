import React, { useState } from 'react';
import { Activity, Lock, Mail, User, ArrowRight, ShieldCheck, Heart, Clock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = fullName.trim() !== '' && email.trim() !== '' && password.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      // Signup: Store credentials in localStorage
      localStorage.setItem('caresync_user', JSON.stringify({ fullName, email, password }));
      onLogin(fullName.trim());
    } else {
      // Login: Verify credentials
      const storedUser = JSON.parse(localStorage.getItem('caresync_user'));
      
      if (!storedUser) {
        setError('No account found. Please sign up first.');
        return;
      }

      if (storedUser.email === email && storedUser.password === password) {
        onLogin(storedUser.fullName);
      } else {
        setError('Email or password does not match.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-brand-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-display font-extrabold tracking-tight">CareSync</span>
          </div>

          <h1 className="text-[2.5rem] leading-[1.15] font-display font-extrabold mb-5">
            Your health,<br />managed smarter.
          </h1>
          <p className="text-brand-200 text-[1.05rem] leading-relaxed max-w-md">
            AI-powered medication tracking, diet analysis, and care scheduling — all in one secure dashboard.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4 text-brand-200" />
            </div>
            <div>
              <p className="font-semibold text-sm">Smart Medication Tracking</p>
              <p className="text-brand-200 text-sm mt-0.5">AI explains why each med is scheduled when it is.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-brand-200" />
            </div>
            <div>
              <p className="font-semibold text-sm">24/7 Health Companion</p>
              <p className="text-brand-200 text-sm mt-0.5">Ask health questions anytime with instant AI responses.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-brand-200" />
            </div>
            <div>
              <p className="font-semibold text-sm">Private & Secure</p>
              <p className="text-brand-200 text-sm mt-0.5">Your data stays on your device. No cloud storage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-display font-extrabold text-slate-800 tracking-tight">CareSync</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isSignup ? 'Join CareSync to start managing your health.' : 'Sign in to access your health dashboard.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="login-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-slate-400"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-10 pr-20 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder:text-slate-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 font-semibold text-sm rounded-lg py-2.5 transition-all ${
                isFormValid
                  ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSignup ? 'Create Account' : 'Sign in to Dashboard'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-brand-600 font-medium hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} /> HIPAA Ready
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={13} /> Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
