// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!agreedToTerms) { setError('Please accept the Terms of Use to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      const { approved, role } = await login(email.trim(), password);
      if (!approved) { navigate('/pending'); return; }
      navigate(role === 'admin' ? '/admin' : '/home');
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found'
          ? 'Invalid email or password.'
          : err.message || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%]  w-[500px] h-[500px] bg-sky-600/12   rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">

        {/* ── CAMPEER HERO LOGO ── */}
        <div className="text-center mb-8">
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-600/20 border border-sky-500/30 mb-5 shadow-lg shadow-sky-500/10">
            <GraduationCap size={28} className="text-sky-300" />
          </div>

          {/* Main CAMPEER title — ultra visible */}
          <h1
            className="campeer-logo-hero text-6xl sm:text-7xl mb-3 select-none"
            style={{ lineHeight: 1.1, overflow: 'visible' }}
          >
            CAMPEER
          </h1>

          {/* Tagline — readable subtitle */}
          <p className="text-slate-300 text-sm font-body leading-relaxed max-w-xs mx-auto">
            <span className="text-sky-400 font-semibold">C</span>ampus{' '}
            <span className="text-sky-400 font-semibold">A</span>cademic{' '}
            <span className="text-sky-400 font-semibold">M</span>arketplace for{' '}
            <span className="text-sky-400 font-semibold">P</span>eer{' '}
            <span className="text-sky-400 font-semibold">E</span>xchange and{' '}
            <span className="text-sky-400 font-semibold">E</span>arning{' '}
            <span className="text-sky-400 font-semibold">R</span>esources
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div className="glass-strong p-8 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your student account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@jrmsu.edu.ph"
                required
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div
              onClick={() => setAgreedToTerms(v => !v)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                ${agreedToTerms
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-white/3 border-white/10 hover:border-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                ${agreedToTerms ? 'bg-sky-500 border-sky-500' : 'border-slate-500 bg-transparent'}`}>
                {agreedToTerms && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors font-medium">
                  Terms of Use
                </a>
                {' '}and confirm I will use CAMPEER responsibly and ethically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className={`btn-primary w-full flex items-center justify-center gap-2 mt-1 py-3 transition-all
                ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <LogIn size={16} />
              }
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          JRMSU Students Only · Approved Accounts Required
        </p>
      </div>
    </div>
  );
}