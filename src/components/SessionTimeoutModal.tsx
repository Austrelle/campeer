// src/components/SessionTimeoutModal.tsx
import { Clock, LogIn, LogOut } from 'lucide-react';

interface Props { countdown: number; onStay: () => void; onLogout: () => void; }

export default function SessionTimeoutModal({ countdown, onStay, onLogout }: Props) {
  const mins    = Math.floor(countdown / 60);
  const secs    = countdown % 60;
  const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  const pct     = countdown / 120;
  const color   = pct > 0.5 ? '#f59e0b' : pct > 0.25 ? '#f97316' : '#ef4444';
  const r = 26; const circ = 2 * Math.PI * r;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-xs sm:max-w-sm animate-scale-in">
        <div className="glass-strong shadow-2xl shadow-black/60 p-6 sm:p-8 text-center rounded-2xl">

          {/* SVG countdown ring */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
                  strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s linear, stroke 0.5s' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-sm" style={{ color }}>{timeStr}</span>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25
                          flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-amber-400" />
          </div>

          <h2 className="text-lg sm:text-xl font-display font-bold text-white mb-2">Still there?</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
            You've been inactive. For your security you'll be automatically logged out in{' '}
            <span className="font-semibold" style={{ color }}>{timeStr}</span>.
          </p>

          <div className="flex gap-2 sm:gap-3">
            <button onClick={onStay}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
              <LogIn size={14} /> Stay Logged In
            </button>
            <button onClick={onLogout}
              className="flex-1 btn-danger flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5">
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}