// src/pages/FeedbackPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Feedback } from '../types';
import { MessageSquare, Send, CheckCircle2, AlertCircle, ChevronDown, Clock, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { deleteDoc } from 'firebase/firestore';

export default function FeedbackPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const [form, setForm] = useState({ type: 'suggestion', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Student: only their own feedbacks for the submission history
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  // Admin: all feedbacks
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);

  // Load student's own past submissions
  useEffect(() => {
    if (!userProfile || isAdmin) return;
    const q = query(
      collection(db, 'feedbacks'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setMyFeedbacks(snap.docs.map(d => ({ feedbackId: d.id, ...d.data() } as Feedback)));
    });
  }, [userProfile, isAdmin]);

  // Admin: load all feedbacks
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setAllFeedbacks(snap.docs.map(d => ({ feedbackId: d.id, ...d.data() } as Feedback)));
    });
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) { setError('Please write your feedback.'); return; }
    if (form.message.trim().length < 10) { setError('Feedback must be at least 10 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: userProfile!.uid,
        userName: userProfile!.fullName,
        userDept: userProfile!.academic.dept,
        type: form.type,
        message: form.message.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setForm({ type: 'suggestion', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  const markReviewed = async (id: string) => {
    await updateDoc(doc(db, 'feedbacks', id), { status: 'reviewed' });
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    await deleteDoc(doc(db, 'feedbacks', id));
  };

  // ─── ADMIN VIEW ─────────────────────────────────────────────────
  if (isAdmin) {
    const pending  = allFeedbacks.filter(f => f.status === 'pending');
    const reviewed = allFeedbacks.filter(f => f.status === 'reviewed');

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-amber-400" />
          </div>
          <div>
            <h1 className="page-header leading-tight">Student Feedbacks</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Review and manage all student submissions</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    val: allFeedbacks.length, color: 'text-sky-400',     bg: 'bg-sky-500/10'     },
            { label: 'Pending',  val: pending.length,      color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
            { label: 'Reviewed', val: reviewed.length,     color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(s => (
            <div key={s.label} className="glass-card p-3 sm:p-4 text-center">
              <div className={`text-xl sm:text-2xl font-display font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending feedbacks */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
              <Clock size={13} className="text-amber-400" /> Pending ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map(fb => (
                <FeedbackCard key={fb.feedbackId} fb={fb} onMarkReviewed={markReviewed} onDelete={deleteFeedback} />
              ))}
            </div>
          </div>
        )}

        {/* Reviewed feedbacks */}
        <div>
          <h2 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" /> Reviewed ({reviewed.length})
          </h2>
          {reviewed.length === 0 ? (
            <div className="glass-card p-6 text-center text-slate-500 text-sm">No reviewed feedbacks yet.</div>
          ) : (
            <div className="space-y-3">
              {reviewed.map(fb => (
                <FeedbackCard key={fb.feedbackId} fb={fb} onDelete={deleteFeedback} />
              ))}
            </div>
          )}
        </div>

        {allFeedbacks.length === 0 && (
          <div className="glass-card p-12 text-center">
            <MessageSquare size={28} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No student feedbacks yet.</p>
          </div>
        )}
      </div>
    );
  }

  // ─── STUDENT VIEW ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-header">Feedback & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Share suggestions, report issues, or send us your thoughts about CAMPEER.</p>
      </div>

      {/* Submit Form */}
      <div className="glass-strong p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare size={18} className="text-sky-400" />
          <h2 className="font-display font-semibold text-slate-200">Submit Feedback</h2>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-emerald-400 text-sm">
            <CheckCircle2 size={15} /> Thank you! Your feedback has been submitted.
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Feedback Type *</label>
            <div className="relative">
              <select className="input-field appearance-none pr-9" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="suggestion" className="bg-[#0f172a]">💡 Suggestion</option>
                <option value="report" className="bg-[#0f172a]">🚨 Report an Issue</option>
                <option value="general" className="bg-[#0f172a]">💬 General Feedback</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="label-text">Your Message *</label>
            <textarea className="input-field resize-none" rows={6} value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder={
                form.type === 'suggestion' ? 'What feature or improvement would you suggest?'
                : form.type === 'report' ? 'Describe the issue you encountered...'
                : 'Share your thoughts about CAMPEER...'
              }
            />
            <p className="text-slate-600 text-xs mt-1 text-right">{form.message.length}/500</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* My Past Feedbacks */}
      <div>
        <h2 className="font-display font-semibold text-slate-300 text-sm mb-3">My Submissions ({myFeedbacks.length})</h2>
        {myFeedbacks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageSquare size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map(fb => (
              <div key={fb.feedbackId} className="glass-card p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium capitalize text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    {fb.type === 'suggestion' ? '💡' : fb.type === 'report' ? '🚨' : '💬'} {fb.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${fb.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {fb.status}
                    </span>
                    <span className="text-slate-600 text-xs flex items-center gap-1">
                      <Clock size={10} />
                      {fb.createdAt?.seconds ? format(new Date(fb.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared card component used by admin ────────────────────────
function FeedbackCard({ fb, onMarkReviewed, onDelete }: {
  fb: Feedback;
  onMarkReviewed?: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-slate-200 text-xs sm:text-sm font-medium">{fb.userName}</span>
            <span className="text-[10px] capitalize bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
              {fb.type === 'suggestion' ? '💡' : fb.type === 'report' ? '🚨' : '💬'} {fb.type}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border
              ${fb.status === 'reviewed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {fb.status}
            </span>
            <span className="text-slate-600 text-[10px] flex items-center gap-1">
              <Clock size={9} />
              {fb.createdAt?.seconds ? format(new Date(fb.createdAt.seconds * 1000), 'MMM d, yyyy · h:mm a') : 'Just now'}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{fb.message}</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {fb.status === 'pending' && onMarkReviewed && (
            <button
              onClick={() => onMarkReviewed(fb.feedbackId)}
              className="btn-success text-[10px] px-2.5 py-1.5 flex items-center gap-1"
            >
              <CheckCircle2 size={11} /> Done
            </button>
          )}
          <button
            onClick={() => onDelete(fb.feedbackId)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}