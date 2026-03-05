// src/components/Layout.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, PlusCircle, User, Info, MessageSquare, Shield, LogOut, Menu, X } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionTimeoutModal from './SessionTimeoutModal';
import WelcomeBackModal from './WelcomeBackModal';

const AWAY_THRESHOLD = 5 * 60 * 1000;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [taskCount,       setTaskCount]       = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [awayMinutes,     setAwayMinutes]     = useState(0);
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('status', '==', 'open'));
    return onSnapshot(q, snap => setTaskCount(snap.size));
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        if (hiddenAtRef.current !== null) {
          const awayMs = Date.now() - hiddenAtRef.current;
          if (awayMs >= AWAY_THRESHOLD) {
            setAwayMinutes(Math.round(awayMs / 60000));
            setShowWelcomeBack(true);
          }
          hiddenAtRef.current = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userProfile]);

  const handleLogout = async () => {
    setShowWelcomeBack(false);
    await logout();
    navigate('/login');
  };

  const handleStay = () => setShowWelcomeBack(false);

  const { showWarning, countdown, stayLoggedIn } = useSessionTimeout({
    onLogout: handleLogout,
    enabled: !!userProfile,
  });

  const isAdmin   = userProfile?.role === 'admin';
  const initials  = userProfile?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const firstName = userProfile?.fullName?.split(' ')[0] || '';

  const navLinks = [
    { to: '/home',     icon: Home,          label: 'Home'                     },
    { to: '/tasks',    icon: BookOpen,      label: 'Tasks',  badge: taskCount },
    ...(!isAdmin ? [{ to: '/post-task', icon: PlusCircle, label: 'Post Task' }] : []),
    { to: '/about',    icon: Info,          label: 'About'                    },
    { to: '/feedback', icon: MessageSquare, label: 'Feedback'                 },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
    { to: '/profile',  icon: User,          label: 'Profile'                  },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Modals ── */}
      {showWelcomeBack && !showWarning && (
        <WelcomeBackModal
          name={firstName}
          awayMinutes={awayMinutes}
          onStay={handleStay}
          onLogout={handleLogout}
        />
      )}
      {showWarning && (
        <SessionTimeoutModal
          countdown={countdown}
          onStay={stayLoggedIn}
          onLogout={handleLogout}
        />
      )}

      {/* ── Mobile Fullscreen Menu — outside header so it never gets clipped ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          backgroundColor: '#020617',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Top bar inside menu */}
          <div style={{
            height: '56px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#020617', flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: '20px', letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #e0f2fe, #7dd3fc, #818cf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              CAMPEER
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '8px', borderRadius: '10px', border: 'none',
                backgroundColor: 'rgba(255,255,255,0.08)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            {navLinks.map(({ to, icon: Icon, label, badge }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '13px 16px', borderRadius: '14px',
                    textDecoration: 'none', fontWeight: 600, fontSize: '15px',
                    backgroundColor: active ? 'rgba(14,165,233,0.18)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#38bdf8' : '#f1f5f9',
                    border: `1px solid ${active ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {/* Icon box */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: active ? 'rgba(14,165,233,0.22)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#38bdf8' : '#94a3b8',
                  }}>
                    <Icon size={17} />
                  </div>

                  {/* Label */}
                  <span style={{ flex: 1, color: active ? '#38bdf8' : '#f1f5f9' }}>
                    {label}
                  </span>

                  {/* Badge */}
                  {badge != null && badge > 0 && (
                    <span style={{
                      backgroundColor: '#0ea5e9', color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      borderRadius: '999px', padding: '2px 8px',
                      minWidth: '22px', textAlign: 'center',
                    }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom: user info + logout */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#0b1120',
            flexShrink: 0,
          }}>
            {/* User info row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '12px', padding: '0 4px',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#e2e8f0', fontWeight: 600, fontSize: '14px', margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {userProfile?.fullName}
                </p>
                <p style={{
                  color: '#475569', fontSize: '12px', margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {userProfile?.email}
                </p>
              </div>
              {isAdmin && (
                <span style={{
                  backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: '999px',
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', flexShrink: 0,
                }}>
                  Admin
                </span>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                padding: '13px', borderRadius: '14px', cursor: 'pointer',
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.28)',
                color: '#f87171', fontSize: '14px', fontWeight: 600,
              }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 border-b border-white/8"
        style={{
          background: 'rgba(2,6,23,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2">

          {/* Logo */}
          <Link to="/home" className="shrink-0 flex items-center" onClick={() => setMenuOpen(false)}>
            <span className="campeer-logo text-lg tracking-tight select-none">CAMPEER</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link key={to} to={to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${location.pathname === to
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <Icon size={14} />
                {label}
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-sky-500
                                   text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Avatar button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-violet-600
                              flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-slate-300 max-w-[80px] truncate">
                {firstName}
              </span>
              {isAdmin && (
                <span className="hidden md:block badge-pending text-[9px] py-0.5 px-1.5 shrink-0">
                  Admin
                </span>
              )}
            </button>

            {/* Desktop logout */}
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all hidden sm:flex items-center justify-center"
            >
              <LogOut size={16} />
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-lg transition-all"
              style={{
                color: '#94a3b8',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-6 md:py-8 animate-fade-in">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-4 px-4 text-center text-slate-600 text-xs">
        © CCS 2025 <span className="text-slate-500 font-medium">CAMPEER</span>
        <span className="mx-2 text-slate-700">·</span>
        <Link
          to="/terms-inside"
          className="text-slate-500 hover:text-sky-400 transition-colors underline underline-offset-2"
        >
          Terms of Use
        </Link>
      </footer>
    </div>
  );
}