// src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, PlusCircle, User, Info, MessageSquare, Shield, LogOut, Menu, X } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import SessionTimeoutModal from './SessionTimeoutModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [taskCount,  setTaskCount]  = useState(0);

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Open task count badge
  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('status', '==', 'open'));
    return onSnapshot(q, snap => setTaskCount(snap.size));
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  // Session timeout
  const { showWarning, countdown, stayLoggedIn } = useSessionTimeout({
    onLogout: handleLogout,
    enabled:  !!userProfile,
  });

  const isAdmin  = userProfile?.role === 'admin';
  const initials = userProfile?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const navLinks = [
    { to: '/home',      icon: Home,          label: 'Home'                          },
    { to: '/tasks',     icon: BookOpen,      label: 'Tasks',    badge: taskCount    },
    ...(!isAdmin ? [{ to: '/post-task', icon: PlusCircle, label: 'Post Task' }] : []),
    { to: '/about',     icon: Info,          label: 'About'                         },
    { to: '/feedback',  icon: MessageSquare, label: 'Feedback'                      },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
    { to: '/profile',   icon: User,          label: 'Profile'                       },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Session Timeout Modal ── */}
      {showWarning && (
        <SessionTimeoutModal countdown={countdown} onStay={stayLoggedIn} onLogout={handleLogout} />
      )}

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/8"
        style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2">

          {/* Logo */}
          <Link to="/home" className="shrink-0 flex items-center" onClick={() => setMenuOpen(false)}>
            <span className="campeer-logo text-xl sm:text-2xl select-none">CAMPEER</span>
          </Link>

          {/* Desktop nav links */}
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

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* User avatar button */}
            <button onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all active:scale-95">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-violet-600
                              flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-slate-300 max-w-[80px] truncate">
                {userProfile?.fullName?.split(' ')[0]}
              </span>
              {isAdmin && <span className="hidden md:block badge-pending text-[9px] py-0.5 px-1.5 shrink-0">Admin</span>}
            </button>

            {/* Logout */}
            <button onClick={handleLogout} title="Log out"
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all hidden sm:flex items-center justify-center">
              <LogOut size={16} />
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile fullscreen menu ── */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 flex flex-col"
            style={{ background: '#020617' }}>
            <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
              {navLinks.map(({ to, icon: Icon, label, badge }) => (
                <Link key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all
                    ${location.pathname === to
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/25'
                      : 'text-slate-300 bg-white/5 border border-white/8'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${location.pathname === to ? 'bg-sky-500/25' : 'bg-white/8'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="min-w-[24px] h-6 px-2 bg-sky-500 text-white text-xs font-bold
                                     rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile bottom bar */}
            <div className="p-4 border-t border-white/10" style={{ background: '#0a0f1e' }}>
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-violet-600
                                flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium text-sm truncate">{userProfile?.fullName}</p>
                  <p className="text-slate-500 text-xs truncate">{userProfile?.email}</p>
                </div>
                {isAdmin && <span className="badge-pending text-xs shrink-0">Admin</span>}
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl
                           bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold
                           active:bg-red-500/25 transition-all">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-6 md:py-8 animate-fade-in">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-4 px-4 text-center text-slate-600 text-xs">
        © 2024 <span className="text-slate-500 font-medium">CAMPEER</span>
        <span className="hidden sm:inline"> — Campus Academic Marketplace for Peer Exchange and Earning Resources</span>
        <span className="sm:hidden"> — JRMSU Campus Marketplace</span>
      </footer>
    </div>
  );
}