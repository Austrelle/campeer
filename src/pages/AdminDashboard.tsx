// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, where, getDocs, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Task, Feedback } from '../types';
import { Users, BookOpen, MessageSquare, Shield, CheckCircle, Trash2, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

type Tab = 'users' | 'tasks' | 'feedbacks';

export default function AdminDashboard() {
  const [tab,           setTab]           = useState<Tab>('users');
  const [users,         setUsers]         = useState<UserProfile[]>([]);
  const [tasks,         setTasks]         = useState<Task[]>([]);
  const [feedbacks,     setFeedbacks]     = useState<Feedback[]>([]);
  const [stats,         setStats]         = useState({ pending: 0, approved: 0, open: 0, total: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'users'),     orderBy('createdAt', 'desc')), snap => {
      const all = snap.docs.map(d => d.data() as UserProfile);
      setUsers(all);
      setStats(s => ({ ...s, pending: all.filter(u => !u.isApproved && u.role !== 'admin').length, approved: all.filter(u => u.isApproved).length, total: all.length }));
    });
    const u2 = onSnapshot(query(collection(db, 'tasks'),     orderBy('createdAt', 'desc')), snap => {
      const all = snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task));
      setTasks(all);
      setStats(s => ({ ...s, open: all.filter(t => t.status === 'open').length }));
    });
    const u3 = onSnapshot(query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc')), snap =>
      setFeedbacks(snap.docs.map(d => ({ feedbackId: d.id, ...d.data() } as Feedback)))
    );
    return () => { u1(); u2(); u3(); };
  }, []);

  const approveUser = async (uid: string) => {
    setActionLoading(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { isApproved: true });
      await addDoc(collection(db, 'notifications'), { userId: uid, message: '🎉 Your CAMPEER account has been approved! Welcome to the marketplace.', read: false, type: 'approval', createdAt: serverTimestamp() });
    } finally { setActionLoading(null); }
  };

  const revokeUser = async (user: UserProfile) => {
    if (!confirm(`Delete account for ${user.fullName}? This cannot be undone.`)) return;
    setActionLoading(user.uid);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      const tq = await getDocs(query(collection(db, 'tasks'), where('requesterId', '==', user.uid)));
      await Promise.all(tq.docs.map(d => deleteDoc(d.ref)));
    } finally { setActionLoading(null); }
  };

  const deleteTask           = async (id: string) => { if (!confirm('Delete this task?')) return; await deleteDoc(doc(db, 'tasks', id)); };
  const markFeedbackReviewed = async (id: string) => { await updateDoc(doc(db, 'feedbacks', id), { status: 'reviewed' }); };

  const pendingUsers  = users.filter(u => !u.isApproved && u.role !== 'admin');
  const approvedUsers = users.filter(u =>  u.isApproved && u.role !== 'admin');

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-amber-400" />
        </div>
        <div>
          <h1 className="page-header leading-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Manage users, tasks, and platform activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Pending',       val: stats.pending,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: Clock        },
          { label: 'Approved',      val: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle  },
          { label: 'Open Tasks',    val: stats.open,     color: 'text-sky-400',     bg: 'bg-sky-500/10',     icon: Activity     },
          { label: 'Total Users',   val: stats.total,    color: 'text-violet-400',  bg: 'bg-violet-500/10',  icon: Users        },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 sm:p-4">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon size={14} className={s.color} />
            </div>
            <div className={`text-xl sm:text-2xl font-display font-bold ${s.color}`}>{s.val}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 glass p-1 rounded-xl overflow-x-auto scrollbar-hide w-full">
        {([['users', 'Users', Users], ['tasks', 'Tasks', BookOpen], ['feedbacks', 'Feedbacks', MessageSquare]] as const).map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center
              ${tab === t ? 'bg-sky-500/20 text-sky-400 border border-sky-500/25' : 'text-slate-500 hover:text-slate-300'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="space-y-5">
          <section>
            <h3 className="font-semibold text-slate-300 text-xs sm:text-sm mb-3 flex items-center gap-2">
              <Clock size={13} className="text-amber-400" /> Pending Approval ({pendingUsers.length})
            </h3>
            {pendingUsers.length === 0
              ? <div className="glass-card p-6 text-center text-slate-500 text-sm">No pending registrations</div>
              : <div className="space-y-2 sm:space-y-3">{pendingUsers.map(u => <UserRow key={u.uid} user={u} actionLoading={actionLoading} onApprove={() => approveUser(u.uid)} onRevoke={() => revokeUser(u)} />)}</div>
            }
          </section>

          <section>
            <h3 className="font-semibold text-slate-300 text-xs sm:text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={13} className="text-emerald-400" /> Approved Students ({approvedUsers.length})
            </h3>
            {approvedUsers.length === 0
              ? <div className="glass-card p-6 text-center text-slate-500 text-sm">No approved users yet</div>
              : <div className="space-y-2">{approvedUsers.map(u => <UserRow key={u.uid} user={u} approved actionLoading={actionLoading} onRevoke={() => revokeUser(u)} />)}</div>
            }
          </section>
        </div>
      )}

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <div className="space-y-2 sm:space-y-3">
          {tasks.length === 0
            ? <div className="glass-card p-8 text-center text-slate-500 text-sm">No tasks yet</div>
            : tasks.map(task => (
              <div key={task.taskId} className="glass-card p-3 sm:p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-200 text-xs sm:text-sm line-clamp-1">{task.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                      ${task.status === 'open' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : task.status === 'claimed' ? 'bg-sky-500/15 text-sky-400 border-sky-500/25'
                        : 'bg-slate-500/15 text-slate-400 border-slate-500/25'}`}>{task.status}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-[10px] sm:text-xs">{task.subject}</span>
                    <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold">₱{task.budget.toLocaleString()}</span>
                    <span className="text-slate-600 text-[10px] sm:text-xs">by {task.requesterName}</span>
                  </div>
                </div>
                <button onClick={() => deleteTask(task.taskId)}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          }
        </div>
      )}

      {/* FEEDBACKS TAB */}
      {tab === 'feedbacks' && (
        <div className="space-y-2 sm:space-y-3">
          {feedbacks.length === 0
            ? <div className="glass-card p-8 text-center text-slate-500 text-sm">No feedbacks submitted</div>
            : feedbacks.map(fb => (
              <div key={fb.feedbackId} className="glass-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-slate-200 text-xs sm:text-sm font-medium">{fb.userName}</span>
                      <span className="text-[10px] capitalize bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">{fb.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border
                        ${fb.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {fb.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{fb.message}</p>
                  </div>
                  {fb.status === 'pending' && (
                    <button onClick={() => markFeedbackReviewed(fb.feedbackId)}
                      className="btn-success text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 shrink-0 flex items-center gap-1">
                      <CheckCircle size={11} /> Done
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

function UserRow({ user, approved = false, actionLoading, onApprove, onRevoke }: {
  user: UserProfile; approved?: boolean; actionLoading: string | null;
  onApprove?: () => void; onRevoke: () => void;
}) {
  const initials = user.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  const loading  = actionLoading === user.uid;
  return (
    <div className="glass-card p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600
                        flex items-center justify-center text-xs font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-200 text-xs sm:text-sm truncate">{user.fullName}</div>
          <div className="text-slate-500 text-[10px] sm:text-xs font-mono">{user.studentId}</div>
          <div className="text-slate-600 text-[10px] hidden sm:block">{user.academic.dept} · {user.academic.course} · Year {user.academic.year}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {!approved && onApprove && (
          <button onClick={onApprove} disabled={loading}
            className="btn-success text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 flex items-center gap-1">
            {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={11} />}
            Approve
          </button>
        )}
        <button onClick={onRevoke} disabled={loading}
          className="btn-danger text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 flex items-center gap-1">
          {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={11} />}
          {approved ? 'Revoke' : 'Reject'}
        </button>
      </div>
    </div>
  );
}