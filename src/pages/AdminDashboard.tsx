// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import {
  collection, query, onSnapshot, orderBy, doc, updateDoc,
  deleteDoc, where, getDocs, serverTimestamp, addDoc
} from 'firebase/firestore';
import { getAuth, deleteUser as fbDeleteUser } from 'firebase/auth';
import { db } from '../firebase';
import { UserProfile, Task, Feedback } from '../types';
import {
  Users, BookOpen, MessageSquare, Shield, CheckCircle, XCircle,
  Trash2, Clock, AlertCircle, Activity, TrendingUp, Eye
} from 'lucide-react';
import { format } from 'date-fns';

type Tab = 'users' | 'tasks' | 'feedbacks';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, open: 0, total: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), snap => {
      const all = snap.docs.map(d => d.data() as UserProfile);
      setUsers(all);
      setStats(s => ({
        ...s,
        pending: all.filter(u => !u.isApproved && u.role !== 'admin').length,
        approved: all.filter(u => u.isApproved).length,
        total: all.length,
      }));
    });
    const unsub2 = onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), snap => {
      const all = snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task));
      setTasks(all);
      setStats(s => ({ ...s, open: all.filter(t => t.status === 'open').length }));
    });
    const unsub3 = onSnapshot(query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc')), snap => {
      setFeedbacks(snap.docs.map(d => ({ feedbackId: d.id, ...d.data() } as Feedback)));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const approveUser = async (uid: string, name: string) => {
    setActionLoading(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { isApproved: true });
      await addDoc(collection(db, 'notifications'), {
        userId: uid,
        message: '🎉 Your CAMPEER account has been approved! Welcome to the marketplace.',
        read: false,
        type: 'approval',
        createdAt: serverTimestamp(),
      });
    } finally { setActionLoading(null); }
  };

  const revokeUser = async (user: UserProfile) => {
    if (!confirm(`Revoke and DELETE account for ${user.fullName}? This cannot be undone.`)) return;
    setActionLoading(user.uid);
    try {
      // Delete Firestore record
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete their tasks
      const tq = await getDocs(query(collection(db, 'tasks'), where('requesterId', '==', user.uid)));
      await Promise.all(tq.docs.map(d => deleteDoc(d.ref)));
      // Note: Deleting Firebase Auth user from client requires the user to be signed in.
      // For production, use Admin SDK Cloud Function. This deletes the Firestore record.
      alert(`${user.fullName}'s account data deleted. Auth record requires Admin SDK to fully remove.`);
    } finally { setActionLoading(null); }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const markFeedbackReviewed = async (id: string) => {
    await updateDoc(doc(db, 'feedbacks', id), { status: 'reviewed' });
  };

  const pendingUsers = users.filter(u => !u.isApproved && u.role !== 'admin');
  const approvedUsers = users.filter(u => u.isApproved && u.role !== 'admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <Shield size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="page-header">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage users, tasks, and platform activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending Approvals', val: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
          { label: 'Approved Users', val: stats.approved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
          { label: 'Open Tasks', val: stats.open, color: 'text-sky-400', bg: 'bg-sky-500/10', icon: Activity },
          { label: 'Total Users', val: stats.total, color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Users },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass p-1 rounded-xl w-fit">
        {([['users', 'Users', Users], ['tasks', 'Tasks', BookOpen], ['feedbacks', 'Feedbacks', MessageSquare]] as const).map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t ? 'bg-sky-500/20 text-sky-400 border border-sky-500/25' : 'text-slate-500 hover:text-slate-300'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="space-y-5">
          {/* Pending */}
          <div>
            <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
              <Clock size={14} className="text-amber-400" /> Pending Approval ({pendingUsers.length})
            </h3>
            {pendingUsers.length === 0 ? (
              <div className="glass-card p-6 text-center text-slate-500 text-sm">No pending registrations</div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(u => (
                  <UserRow key={u.uid} user={u} actionLoading={actionLoading}
                    onApprove={() => approveUser(u.uid, u.fullName)}
                    onRevoke={() => revokeUser(u)} />
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          <div>
            <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" /> Approved Students ({approvedUsers.length})
            </h3>
            {approvedUsers.length === 0 ? (
              <div className="glass-card p-6 text-center text-slate-500 text-sm">No approved users yet</div>
            ) : (
              <div className="space-y-2">
                {approvedUsers.map(u => (
                  <UserRow key={u.uid} user={u} approved actionLoading={actionLoading}
                    onRevoke={() => revokeUser(u)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">No tasks yet</div>
          ) : (
            tasks.map(task => (
              <div key={task.taskId} className="glass-card p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 text-sm">{task.title}</span>
                    <span className={task.status === 'open' ? 'badge-open' : task.status === 'claimed' ? 'badge-claimed' : 'badge-completed'}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-slate-500 text-xs">{task.subject}</span>
                    <span className="text-emerald-400 text-xs font-semibold">₱{task.budget}</span>
                    <span className="text-slate-600 text-xs">by {task.requesterName}</span>
                    {task.createdAt?.seconds && (
                      <span className="text-slate-700 text-xs">{format(new Date(task.createdAt.seconds * 1000), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.taskId)} className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* FEEDBACKS TAB */}
      {tab === 'feedbacks' && (
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500">No feedbacks submitted</div>
          ) : (
            feedbacks.map(fb => (
              <div key={fb.feedbackId} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-slate-200 text-sm font-medium">{fb.userName}</span>
                      <span className="text-xs capitalize bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">{fb.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${fb.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {fb.status}
                      </span>
                      {fb.createdAt?.seconds && (
                        <span className="text-slate-600 text-xs">{format(new Date(fb.createdAt.seconds * 1000), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{fb.message}</p>
                  </div>
                  {fb.status === 'pending' && (
                    <button onClick={() => markFeedbackReviewed(fb.feedbackId)}
                      className="btn-success text-xs px-3 py-1.5 shrink-0 flex items-center gap-1">
                      <CheckCircle size={12} /> Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
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
  return (
    <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-200 text-sm">{user.fullName}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-xs font-mono">{user.studentId}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">{user.academic.dept} · {user.academic.course} · Year {user.academic.year}</span>
          </div>
          <div className="text-slate-600 text-xs mt-0.5">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!approved && onApprove && (
          <button onClick={onApprove} disabled={actionLoading === user.uid}
            className="btn-success text-xs px-3 py-1.5 flex items-center gap-1.5">
            {actionLoading === user.uid ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={12} />}
            Approve
          </button>
        )}
        <button onClick={onRevoke} disabled={actionLoading === user.uid}
          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5">
          {actionLoading === user.uid ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={12} />}
          {approved ? 'Revoke & Delete' : 'Reject'}
        </button>
      </div>
    </div>
  );
}
