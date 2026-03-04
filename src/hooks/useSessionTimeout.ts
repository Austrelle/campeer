// src/hooks/useSessionTimeout.ts
import { useEffect, useRef, useState, useCallback } from 'react';

const INACTIVE_MS  = 30 * 60 * 1000; // 30 min until warning
const WARNING_MS   =  2 * 60 * 1000; //  2 min warning countdown

interface Options { onLogout: () => void; enabled: boolean; }

export function useSessionTimeout({ onLogout, enabled }: Options) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(120);

  const warnTimer   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const outTimer    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tickTimer   = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    if (warnTimer.current)  clearTimeout(warnTimer.current);
    if (outTimer.current)   clearTimeout(outTimer.current);
    if (tickTimer.current)  clearInterval(tickTimer.current);
  }, []);

  const startTimers = useCallback(() => {
    if (!enabled) return;
    clearAll();
    setShowWarning(false);
    setCountdown(120);

    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);

      tickTimer.current = setInterval(() =>
        setCountdown(p => { if (p <= 1) { clearInterval(tickTimer.current!); return 0; } return p - 1; })
      , 1000);

      outTimer.current = setTimeout(() => {
        setShowWarning(false);
        onLogout();
      }, WARNING_MS);

    }, INACTIVE_MS - WARNING_MS);
  }, [enabled, clearAll, onLogout]);

  const resetActivity = useCallback(() => {
    if (!enabled || showWarning) return;
    startTimers();
  }, [enabled, showWarning, startTimers]);

  const stayLoggedIn = useCallback(() => {
    setShowWarning(false);
    setCountdown(120);
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    if (!enabled) return;
    startTimers();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => { clearAll(); events.forEach(e => window.removeEventListener(e, resetActivity)); };
  }, [enabled, startTimers, resetActivity, clearAll]);

  return { showWarning, countdown, stayLoggedIn };
}