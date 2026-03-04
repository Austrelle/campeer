// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';
import { BookOpen, PlusCircle, CheckCircle, Users, Clock, ArrowRight, Zap, Award, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { userProfile } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ open: 0, claimed: 0, completed: 0, users: 0 });

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(4));
    return onSnapshot(q, snap => setRecentTasks(snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task))));
  }, []);

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'tasks'), where('status', '==', 'open'))),
      getDocs(query(collection(db, 'tasks'), where('status', '==', 'claimed'))),
      getDocs(query(collection(db, 'tasks'), where('status', '==', 'completed'))),
      getDocs(query(collection(db, 'users'),  where('isApproved', '==', true))),
    ]).then(([o, cl, co, u]) => setStats({ open: o.size, claimed: cl.size, completed: co.size, users: u.size }));
  }, []);

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = userProfile?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-7
                      bg-gradient-to-br from-sky-600/20 via-blue-600/10 to-violet-600/15
                      border border-sky-500/20">
        <div className="absolute top-0 right-0 w-40 sm:w-56 h-40 sm:h-56
                        bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-sky-400/80 text-xs sm:text-sm font-medium mb-1">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 mb-2 leading-tight">
            {firstName} 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-4">
            Welcome to <span className="text-sky-400 font-semibold">CAMPEER</span> — your campus academic
            marketplace. Find tasks, earn, and collaborate with fellow JRMSU students.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/tasks" className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4">
              <BookOpen size={13} /> Browse Tasks
            </Link>
            {userProfile?.role !== 'admin' && (
              <Link to="/post-task" className="btn-secondary inline-flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:px-4">
                <PlusCircle size={13} /> Post a Task
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Open Tasks',      value: stats.open,      icon: Zap,         color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Progress',     value: stats.claimed,   icon: Activity,    color: 'text-sky-400',     bg: 'bg-sky-500/10'     },
          { label: 'Completed',       value: stats.completed, icon: CheckCircle, color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
          { label: 'Active Students', value: stats.users,     icon: Users,       color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 sm:p-4">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={14} className={s.color} />
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-slate-100">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-display font-semibold text-slate-200">Recent Tasks</h2>
          <Link to="/tasks" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 transition-colors">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <BookOpen size={22} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No tasks yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
            {recentTasks.map(task => (
              <div key={task.taskId} className="glass-card p-3 sm:p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-200 text-sm leading-snug line-clamp-2 flex-1">{task.title}</h3>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border
                    ${task.status === 'open'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      : task.status === 'claimed'
                      ? 'bg-sky-500/15 text-sky-400 border-sky-500/25'
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/25'}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{task.description}</p>
                <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/5">
                  <span className="text-emerald-400 font-bold text-sm">₱{task.budget.toLocaleString()}</span>
                  <span className="text-slate-600 text-xs flex items-center gap-1">
                    <Clock size={10} />
                    {task.createdAt?.seconds ? format(new Date(task.createdAt.seconds * 1000), 'MMM d') : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
        {[
          { icon: Award,       title: 'Earn While You Learn',    desc: 'Help fellow students and earn money doing what you do best.', color: 'text-amber-400' },
          { icon: BookOpen,    title: 'All Subjects Covered',    desc: 'From programming to research — find tasks matching your skills.', color: 'text-sky-400' },
          { icon: CheckCircle, title: 'Verified Students Only',  desc: 'All users are verified JRMSU students for a safe trusted community.', color: 'text-emerald-400' },
        ].map(c => (
          <div key={c.title} className="glass-card p-4">
            <c.icon size={18} className={`${c.color} mb-2.5`} />
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-1">{c.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}