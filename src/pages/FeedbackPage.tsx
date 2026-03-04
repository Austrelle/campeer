// src/pages/FeedbackPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Feedback } from '../types';
import { MessageSquare, Send, CheckCircle2, AlertCircle, ChevronDown, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function FeedbackPage() {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({ type: 'suggestion', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(
      collection(db, 'feedbacks'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setMyFeedbacks(snap.docs.map(d => ({ feedbackId: d.id, ...d.data() } as Feedback)));
    });
    return unsub;
  }, [userProfile]);

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
