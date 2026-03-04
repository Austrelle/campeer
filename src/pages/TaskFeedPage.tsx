// src/pages/TaskFeedPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, query, onSnapshot, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp, addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';
import { TASK_SUBJECTS, ensureUrl } from '../utils/constants';
import { atob_ } from '../utils/crypto';
import UserProfileModal from '../components/UserProfileModal';
import {
  Search, Clock, Lock, Unlock, User, Phone, Facebook,
  CheckCircle, BookOpen, AlertCircle, Trash2, ExternalLink,
  ChevronDown, Eye
} from 'lucide-react';
import { format } from 'date-fns';

export default function TaskFeedPage() {
  const { userProfile } = useAuth();
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [filter, setFilter]         = useState<'all' | 'open' | 'claimed' | 'completed'>('all');
  const [search, setSearch]         = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  /* real-time listener */
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap =>
      setTasks(snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task)))
    );
  }, []);

  /* filtered list */
  const filtered = tasks.filter(t => {
    const okStatus  = filter === 'all' || t.status === filter;
    const okSearch  = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
                      t.description.toLowerCase().includes(search.toLowerCase());
    const okSubject = !subjectFilter || t.subject === subjectFilter;
    return okStatus && okSearch && okSubject;
  });

  /* claim a task */
  const handleClaim = async (task: Task) => {
    if (!userProfile || task.requesterId === userProfile.uid) return;
    setClaimingId(task.taskId);
    try {
      await updateDoc(doc(db, 'tasks', task.taskId), {
        status:        'claimed',
        claimedBy:     userProfile.uid,
        claimedByName: userProfile.fullName,
        claimedAt:     serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        userId:    task.requesterId,
        message:   `${userProfile.fullName} claimed your task: "${task.title}"`,
        read:      false,
        type:      'task',
        createdAt: serverTimestamp(),
      });
    } finally { setClaimingId(null); }
  };

  /* mark complete */
  const handleComplete = async (task: Task) => {
    await updateDoc(doc(db, 'tasks', task.taskId), { status: 'completed' });
  };

  /* delete own task */
  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setDeletingId(task.taskId);
    try { await deleteDoc(doc(db, 'tasks', task.taskId)); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Task Feed</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="glass p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            className="input-field pl-10"
            placeholder="Search tasks by title or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {(['all', 'open', 'claimed', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === s
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/10'}`}
            >
              {s}
            </button>
          ))}

          <div className="relative">
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium
                         bg-white/5 text-slate-400 border border-white/10 cursor-pointer
                         focus:outline-none focus:border-sky-500/40 hover:bg-white/8 transition-all"
            >
              <option value="" className="bg-[#0f172a]">All Subjects</option>
              {TASK_SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Task Cards ── */}
      {filtered.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <BookOpen size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">No tasks found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(task => (
            <TaskCard
              key={task.taskId}
              task={task}
              userProfile={userProfile}
              claimingId={claimingId}
              deletingId={deletingId}
              onClaim={handleClaim}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onViewProfile={uid => setViewUserId(uid)}
            />
          ))}
        </div>
      )}

      {/* ── Poster Profile Modal ── */}
      {viewUserId && (
        <UserProfileModal userId={viewUserId} onClose={() => setViewUserId(null)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Individual Task Card
───────────────────────────────────────── */
function TaskCard({ task, userProfile, claimingId, deletingId, onClaim, onComplete, onDelete, onViewProfile }: {
  task: Task;
  userProfile: any;
  claimingId: string | null;
  deletingId: string | null;
  onClaim: (t: Task) => void;
  onComplete: (t: Task) => void;
  onDelete: (t: Task) => void;
  onViewProfile: (uid: string) => void;
}) {
  const isOwner   = task.requesterId === userProfile?.uid;
  const isClaimer = task.claimedBy   === userProfile?.uid;
  const isAdmin   = userProfile?.role === 'admin';

  /* contacts are base64-encoded at post time */
  const fb     = task.requesterFb     ? atob_(task.requesterFb)     : '';
  const mobile = task.requesterMobile ? atob_(task.requesterMobile) : '';

  /* who can see the revealed contact block */
  const canSeeContact = isOwner || isClaimer || isAdmin;
  const showContact   = canSeeContact && (task.status === 'claimed' || task.status === 'completed');

  return (
    <div className="glass-card p-5 flex flex-col gap-3 animate-fade-in">

      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-slate-100 text-base leading-snug line-clamp-2">
              {task.title}
            </h3>
            {isOwner && (
              <span className="shrink-0 text-[10px] bg-violet-500/15 text-violet-400 border border-violet-500/25 px-1.5 py-0.5 rounded-full">
                Your Post
              </span>
            )}
          </div>

          {/* Subject + poster name (clickable) */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-slate-500 text-xs">{task.subject}</span>
            <span className="text-slate-700 text-xs">·</span>
            <button
              onClick={() => onViewProfile(task.requesterId)}
              className="flex items-center gap-1 text-sky-400/80 hover:text-sky-400 text-xs transition-colors group"
              title="View poster profile"
            >
              <User size={10} />
              <span className="underline underline-offset-2 decoration-dashed">{task.requesterName}</span>
              <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Status badge */}
        <span className={`shrink-0 ${task.status === 'open' ? 'badge-open' : task.status === 'claimed' ? 'badge-claimed' : 'badge-completed'}`}>
          {task.status}
        </span>
      </div>

      {/* ── Description ── */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{task.description}</p>

      {/* ── Tags ── */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-500 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Budget + deadline ── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-bold text-lg">₱{task.budget.toLocaleString()}</span>
          {task.deadline && (
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Clock size={11} /> Due {task.deadline}
            </span>
          )}
        </div>
        <span className="text-slate-700 text-xs">
          {task.createdAt?.seconds
            ? format(new Date(task.createdAt.seconds * 1000), 'MMM d, yyyy')
            : 'Recent'}
        </span>
      </div>

      {/* ── Claimed-by info ── */}
      {task.status !== 'open' && task.claimedByName && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Claimed by</span>
          <button
            onClick={() => task.claimedBy && onViewProfile(task.claimedBy)}
            className="text-sky-400/80 hover:text-sky-400 underline underline-offset-2 decoration-dashed transition-colors"
          >
            {task.claimedByName}
          </button>
        </div>
      )}

      {/* ── Revealed contact block ── */}
      {showContact && (
        <div className="p-3 bg-emerald-500/6 border border-emerald-500/20 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <Unlock size={12} /> Contact Info Revealed
          </div>
          {fb && (
            <a
              href={ensureUrl(fb)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg w-full
                         bg-sky-500/8 border border-sky-500/20 hover:bg-sky-500/15
                         hover:border-sky-500/35 transition-all group"
            >
              <Facebook size={13} className="text-sky-400 shrink-0" />
              <span className="text-sky-300 text-sm truncate flex-1">{fb}</span>
              <ExternalLink size={11} className="text-sky-400/60 shrink-0 group-hover:text-sky-400 transition-colors" />
            </a>
          )}
          {mobile && (
            <div className="flex items-center gap-2 text-slate-300 text-sm px-1">
              <Phone size={13} className="text-emerald-400/70 shrink-0" /> {mobile}
            </div>
          )}
        </div>
      )}

      {/* ── Locked hint (open, not owner, not claimer) ── */}
      {task.status === 'open' && !isOwner && (
        <div className="flex items-center gap-2 text-slate-600 text-xs px-1">
          <Lock size={11} /> Contact revealed only after claiming
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-2 mt-1 flex-wrap">
        {/* View poster profile */}
        <button
          onClick={() => onViewProfile(task.requesterId)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                     bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200
                     hover:bg-white/10 transition-all"
        >
          <Eye size={13} /> View Profile
        </button>

        {/* Claim — only if open and not owner */}
        {task.status === 'open' && !isOwner && (
          <button
            onClick={() => onClaim(task)}
            disabled={claimingId === task.taskId}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2"
          >
            {claimingId === task.taskId
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Lock size={14} />
            }
            Claim Task
          </button>
        )}

        {/* Mark complete — claimer or owner */}
        {task.status === 'claimed' && (isOwner || isClaimer) && (
          <button
            onClick={() => onComplete(task)}
            className="flex-1 btn-success flex items-center justify-center gap-2 text-sm py-2"
          >
            <CheckCircle size={14} /> Mark Complete
          </button>
        )}

        {/* Waiting label for owner on open */}
        {task.status === 'open' && isOwner && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-xs gap-1.5 py-2">
            <AlertCircle size={13} /> Waiting for a claimer…
          </div>
        )}

        {/* Delete — owner or admin, only if open */}
        {(isOwner || isAdmin) && task.status === 'open' && (
          <button
            onClick={() => onDelete(task)}
            disabled={deletingId === task.taskId}
            title="Delete this task"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                       bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20
                       hover:text-red-300 transition-all disabled:opacity-50"
          >
            {deletingId === task.taskId
              ? <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              : <Trash2 size={13} />
            }
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
