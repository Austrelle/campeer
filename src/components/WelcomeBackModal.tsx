// src/components/WelcomeBackModal.tsx
import { RefreshCw, LogOut } from 'lucide-react';

interface Props {
  name: string;
  awayMinutes: number;
  onStay: () => void;
  onLogout: () => void;
}

export default function WelcomeBackModal({ name, awayMinutes, onStay, onLogout }: Props) {
  const timeText = awayMinutes >= 60
    ? `${Math.floor(awayMinutes / 60)}h ${awayMinutes % 60 > 0 ? `${awayMinutes % 60}m` : ''}`
    : `${awayMinutes} minute${awayMinutes !== 1 ? 's' : ''}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-xs sm:max-w-sm animate-scale-in">
        <div className="glass-strong shadow-2xl shadow-black/60 p-6 sm:p-7 rounded-2xl">

          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25
                          flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>

          <h2 className="text-lg sm:text-xl font-display font-bold text-white text-center mb-1">
            Welcome back, {name}!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm text-center leading-relaxed mb-2">
            You were away for <span className="text-sky-400 font-semibold">{timeText}</span>.
          </p>

          <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl mb-5">
            <p className="text-amber-400/90 text-xs leading-relaxed text-center">
              ⚠️ For the most up-to-date information, we recommend logging out and logging back in to refresh your session.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={onLogout}
              className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-3">
              <LogOut size={15} /> Log Out & Refresh
            </button>
            <button onClick={onStay}
              className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2.5">
              <RefreshCw size={14} /> Stay & Continue
            </button>
          </div>

          <p className="text-slate-600 text-[10px] text-center mt-3 leading-relaxed">
            Logging out ensures your data and tasks are fully refreshed.
          </p>
        </div>
      </div>
    </div>
  );
}