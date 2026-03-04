// src/pages/PendingPage.tsx
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-amber-600/8 rounded-full blur-3xl" />
      </div>

      <div className="glass-strong p-6 sm:p-10 max-w-sm sm:max-w-md w-full text-center animate-slide-up relative z-10 rounded-2xl">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border border-amber-500/25
                        flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <Clock size={28} className="text-amber-400 animate-pulse" />
        </div>

        {/* Logo */}
        <h1 className="campeer-logo-hero text-4xl sm:text-5xl mb-1" style={{ overflow: 'visible', paddingRight: '0.1em' }}>
          CAMPEER
        </h1>

        <h2 className="text-lg sm:text-xl font-display font-bold text-slate-100 mt-3 mb-2">
          Account Pending Approval
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
          Your registration has been received! An admin will review and approve your account.
          Please check back later or contact your campus administrator.
        </p>

        <div className="badge-pending w-fit mx-auto mb-5 text-xs">Awaiting Admin Review</div>

        {/* Steps */}
        <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-left space-y-3 mb-5">
          <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">What happens next?</p>
          {[
            'Admin reviews your student credentials',
            'Your account gets approved or rejected',
            'You can log in and access the marketplace',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/25 flex items-center
                              justify-center text-sky-400 text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <Link to="/login" className="btn-secondary inline-flex items-center gap-2 text-sm w-full justify-center">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}