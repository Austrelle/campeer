// src/pages/PostTaskPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, addDoc, serverTimestamp, query,
  where, onSnapshot, orderBy, deleteDoc, doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task } from '../types';
import { TASK_SUBJECTS } from '../utils/constants';
import { btoa } from '../utils/crypto';
import {
  PlusCircle, AlertCircle, CheckCircle2, ChevronDown,
  X, Trash2, BookOpen, Clock, List, EyeOff
} from 'lucide-react';
import { format } from 'date-fns';

type Tab = 'post' | 'my-tasks';

export default function PostTaskPage() {
  const { userProfile } = useAuth();
  const [tab, setTab]         = useState<Tab>('post');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [tagInput, setTagInput] = useState('');
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Budget mode: 'fixed' = numeric, 'secret' = hidden/negotiable
  const [budgetMode, setBudgetMode] = useState<'fixed' | 'secret'>('fixed');

  const [form, setForm] = useState({
    title: '', description: '', subject: '', budget: '', deadline: '', tags: [] as string[],
  });

  const update = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  /* My tasks listener */
  useEffect(() => {
    if (!userProfile) return;
    const q = query(
      collection(db, 'tasks'),
      where('requesterId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap =>
      setMyTasks(snap.docs.map(d => ({ taskId: d.id, ...d.data() } as Task)))
    );
  }, [userProfile]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 5) {
      update('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => update('tags', form.tags.filter(t => t !== tag));

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setDeletingId(task.taskId);
    try { await deleteDoc(doc(db, 'tasks', task.taskId)); }
    finally { setDeletingId(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())        { setError('Title is required.'); return; }
    if (!form.description.trim())  { setError('Description is required.'); return; }
    if (!form.subject)             { setError('Please select a subject.'); return; }
    if (budgetMode === 'fixed') {
      if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0)
        { setError('Please enter a valid budget amount.'); return; }
    }
    if (!form.deadline)            { setError('Please set a deadline.'); return; }
    setError('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        requesterId:     userProfile!.uid,
        requesterName:   userProfile!.fullName,
        requesterDept:   userProfile!.academic.dept,
        requesterFb:     btoa(userProfile!.contact.fbLink),
        requesterMobile: btoa(userProfile!.contact.mobile),
        title:           form.title.trim(),
        description:     form.description.trim(),
        subject:         form.subject,
        budget:          budgetMode === 'secret' ? 0 : Number(form.budget),
        budgetSecret:    budgetMode === 'secret',
        deadline:        form.deadline,
        tags:            form.tags,
        status:          'open',
        claimedBy:       null,
        claimedByName:   null,
        createdAt:       serverTimestamp(),
      });
      setSuccess(true);
      setForm({ title: '', description: '', subject: '', budget: '', deadline: '', tags: [] });
      setBudgetMode('fixed');
      setTimeout(() => { setSuccess(false); setTab('my-tasks'); }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to post task.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="page-header">Tasks</h1>
        <p className="text-slate-500 text-sm mt-0.5">Post new tasks or manage your existing ones.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass p-1 rounded-xl w-fit mb-5">
        {([['post', PlusCircle, 'Post Task'], ['my-tasks', List, `My Tasks (${myTasks.length})`]] as const).map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t ? 'bg-sky-500/20 text-sky-400 border border-sky-500/25' : 'text-slate-500 hover:text-slate-300'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── POST TASK TAB ── */}
      {tab === 'post' && (
        <div className="glass-strong p-6 sm:p-8">
          {success && (
            <div className="mb-5 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-emerald-400 text-sm">
              <CheckCircle2 size={15} /> Task posted! Switching to My Tasks…
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">Task Title *</label>
              <input className="input-field" value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="e.g. Help with Python OOP Assignment" />
            </div>

            <div>
              <label className="label-text">Subject / Category *</label>
              <div className="relative">
                <select className="input-field appearance-none pr-9" value={form.subject} onChange={e => update('subject', e.target.value)}>
                  <option value="" className="bg-[#0f172a]">Select subject</option>
                  {TASK_SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="label-text">Task Description *</label>
              <textarea className="input-field resize-none" rows={5} value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe your task in detail: what needs to be done, specific requirements, expected output, etc." />
            </div>

            {/* ── Budget Field with Secret toggle ── */}
            <div>
              <label className="label-text">Price / Budget *</label>
              {/* Mode selector */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setBudgetMode('fixed')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                    ${budgetMode === 'fixed'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  ₱ Set a Price
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetMode('secret')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all
                    ${budgetMode === 'secret'
                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  <EyeOff size={14} /> Secret / Negotiate
                </button>
              </div>

              {budgetMode === 'fixed' ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm pointer-events-none">₱</span>
                  <input
                    type="number"
                    className="input-field pl-8"
                    value={form.budget}
                    onChange={e => update('budget', e.target.value)}
                    placeholder="e.g. 500"
                    min={1}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/8 border border-violet-500/25 rounded-xl">
                  <EyeOff size={16} className="text-violet-400 shrink-0" />
                  <div>
                    <p className="text-violet-300 text-sm font-semibold">Secret Price</p>
                    <p className="text-violet-400/70 text-xs leading-relaxed mt-0.5">
                      The price will be hidden from the feed. Discuss and negotiate directly with the claimer once your task is claimed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="label-text">Deadline *</label>
              <input type="date" className="input-field" value={form.deadline}
                onChange={e => update('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            {/* Tags */}
            <div>
              <label className="label-text">Tags <span className="text-slate-600 lowercase tracking-normal">(optional, max 5)</span></label>
              <div className="flex gap-2 mb-2">
                <input className="input-field flex-1" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="e.g. urgent, python, oop"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" onClick={addTag} className="btn-secondary px-4 text-sm">Add</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-500/5 border border-white/8 rounded-xl">
              <p className="text-slate-500 text-xs">
                🔒 Your contact info (FB link & mobile) will only be revealed to the student who claims this task.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <PlusCircle size={16} />
              }
              {loading ? 'Posting…' : 'Post Task'}
            </button>
          </form>
        </div>
      )}

      {/* ── MY TASKS TAB ── */}
      {tab === 'my-tasks' && (
        <div className="space-y-3">
          {myTasks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BookOpen size={28} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">You haven't posted any tasks yet.</p>
              <button onClick={() => setTab('post')} className="btn-primary mt-4 text-sm inline-flex items-center gap-2">
                <PlusCircle size={14} /> Post Your First Task
              </button>
            </div>
          ) : (
            myTasks.map(task => (
              <div key={task.taskId} className="glass-card p-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-slate-200 text-sm">{task.title}</span>
                    <span className={task.status === 'open' ? 'badge-open' : task.status === 'claimed' ? 'badge-claimed' : 'badge-completed'}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {(task as any).budgetSecret ? (
                      <span className="flex items-center gap-1 text-violet-400 font-semibold text-sm">
                        <EyeOff size={12} /> Secret Price
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-sm">₱{task.budget.toLocaleString()}</span>
                    )}
                    {task.deadline && (
                      <span className="text-slate-600 text-xs flex items-center gap-1">
                        <Clock size={10} /> Due {task.deadline}
                      </span>
                    )}
                    {task.createdAt?.seconds && (
                      <span className="text-slate-700 text-xs">
                        Posted {format(new Date(task.createdAt.seconds * 1000), 'MMM d, yyyy')}
                      </span>
                    )}
                    {task.claimedByName && (
                      <span className="text-sky-400/70 text-xs">Claimed by {task.claimedByName}</span>
                    )}
                  </div>
                </div>

                {/* Delete — only open tasks */}
                {task.status === 'open' && (
                  <button
                    onClick={() => handleDelete(task)}
                    disabled={deletingId === task.taskId}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20
                               hover:text-red-300 transition-all disabled:opacity-50 shrink-0"
                  >
                    {deletingId === task.taskId
                      ? <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={13} />
                    }
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}