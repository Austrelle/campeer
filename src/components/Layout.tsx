// src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, BookOpen, PlusCircle, User, Info, MessageSquare,
  Shield, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return unsub;
  }, [userProfile]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('status', '==', 'open'));
    const unsub = onSnapshot(q, snap => setTaskCount(snap.size));
    return unsub;
  }, []);

  const unread = notifications.filter(n => !n.read).length;
  const isAdmin = userProfile?.role === 'admin';

  const navLinks = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/tasks', icon: BookOpen, label: 'Tasks', badge: taskCount },
    ...(!isAdmin ? [{ to: '/post-task', icon: PlusCircle, label: 'Post Task' }] : []),
    { to: '/about', icon: Info, label: 'About' },
    { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
           <span className="campeer-logo text-lg tracking-tight select-none">CAMPEER</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === to
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                <Icon size={15} />
                {label}
                {badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
    

            {/* User menu */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass cursor-pointer"
              onClick={() => navigate('/profile')}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {userProfile?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:block text-sm text-slate-300 max-w-[100px] truncate">
                {userProfile?.fullName?.split(' ')[0]}
              </span>
              {isAdmin && <span className="hidden sm:block badge-pending text-[10px] py-0.5 px-1.5">Admin</span>}
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={16} />
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#020617]/95 backdrop-blur-xl">
            <nav className="flex flex-col py-2 px-4 gap-1">
              {navLinks.map(({ to, icon: Icon, label, badge }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${location.pathname === to
                      ? 'bg-sky-500/15 text-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                  {badge && badge > 0 && (
                    <span className="ml-auto w-5 h-5 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-slate-600 text-xs font-body">
        © 2026   <span className="text-slate-500">CAMPEER</span> — Campus Academic Marketplace for Peer Exchange and Earning Resources
      </footer>
    </div>
  );
}
