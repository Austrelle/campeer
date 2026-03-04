// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';
import {
  BookOpen, PlusCircle, TrendingUp, Users, CheckCircle,
  Clock, ArrowRight, Zap, Award, Activity
} from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { userProfile } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ open: 0, claimed: 0, completed: 0, users: 0 });

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(4));
    const unsub = onSnapshot(q, snap => {
      setRecentTasks(snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const cols = [
      query(collection(db, 'tasks'), where('status', '==', 'open')),
      query(collection(db, 'tasks'), where('status', '==', 'claimed')),
      query(collection(db, 'tasks'), where('status', '==', 'completed')),
      query(collection(db, 'users'), where('isApproved', '==', true)),
    ];
    Promise.all(cols.map(getDocs)).then(([open, claimed, completed, users]) => {
      setStats({ open: open.size, claimed: claimed.size, completed: completed.size, users: users.size });
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = userProfile?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-sky-600/20 via-blue-600/10 to-violet-600/15 border border-sky-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-sky-400/80 text-sm font-medium mb-1">{greeting},</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-100 mb-2">{firstName} 👋</h1>
          <p className="text-slate-400 text-sm max-w-md">
            Welcome to <span className="text-sky-400 font-semibold">CAMPEER</span> — your campus academic marketplace. 
            Find tasks, earn, and collaborate with fellow JRMSU students.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/tasks" className="btn-primary inline-flex items-center gap-2 text-sm">
              <BookOpen size={15} /> Browse Tasks
            </Link>
            {userProfile?.role !== 'admin' && (
              <Link to="/post-task" className="btn-secondary inline-flex items-center gap-2 text-sm">
                <PlusCircle size={15} /> Post a Task
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open Tasks', value: stats.open, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Progress', value: stats.claimed, icon: Activity, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Active Students', value: stats.users, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="text-2xl font-display font-bold text-slate-100">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-slate-200">Recent Tasks</h2>
          <Link to="/tasks" className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1 transition-colors">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <BookOpen size={28} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No tasks posted yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recentTasks.map(task => (
              <div key={task.taskId} className="glass-card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-200 text-sm leading-tight line-clamp-1">{task.title}</h3>
                  <span className={task.status === 'open' ? 'badge-open' : task.status === 'claimed' ? 'badge-claimed' : 'badge-completed'}>
                    {task.status}
                  </span>
                </div>
                <p className="text-slate-500 text-xs line-clamp-2">{task.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-emerald-400 font-semibold text-sm">₱{task.budget.toLocaleString()}</span>
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

      {/* Quick Info Cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Award, title: 'Earn While You Learn', desc: 'Help fellow students complete their academic tasks and earn money doing what you do best.', color: 'text-amber-400' },
          { icon: BookOpen, title: 'All Subjects Covered', desc: 'From programming to research, find tasks matching your skills and academic expertise.', color: 'text-sky-400' },
          { icon: CheckCircle, title: 'Verified Students Only', desc: 'All users are verified JRMSU students, ensuring a safe and trusted academic community.', color: 'text-emerald-400' },
        ].map(card => (
          <div key={card.title} className="glass-card p-5">
            <card.icon size={22} className={`${card.color} mb-3`} />
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-1.5">{card.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
