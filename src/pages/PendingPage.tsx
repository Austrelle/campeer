// src/pages/PendingPage.tsx
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl" />
      </div>
      <div className="glass-strong p-10 max-w-md w-full text-center animate-slide-up relative z-10">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-5">
          <Clock size={36} className="text-amber-400 animate-pulse" />
        </div>
        <h1 className="campeer-logo text-3xl mb-2">CAMPEER</h1>
        <h2 className="text-xl font-display font-bold text-slate-100 mb-3">Account Pending Approval</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Your registration has been received. An admin will review and approve your account. 
          Please check back later or contact your campus administrator.
        </p>
        <div className="badge-pending w-fit mx-auto mb-6">Awaiting Admin Review</div>
        <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-left space-y-2 mb-6">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">What happens next?</p>
          <p className="text-slate-400 text-sm">1. Admin reviews your student credentials</p>
          <p className="text-slate-400 text-sm">2. Your account gets approved or rejected</p>
          <p className="text-slate-400 text-sm">3. You can log in and access the marketplace</p>
        </div>
        <Link to="/login" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
