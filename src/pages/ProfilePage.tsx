// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CAMPUSES, DEPARTMENTS, COURSES, YEAR_LEVELS, studentIdRegex, mobileRegex, validateFbLink, ensureUrl } from '../utils/constants';
import { User, Edit2, Save, X, CheckCircle2, AlertCircle, ChevronDown, Shield, BookOpen, Phone, Facebook, ExternalLink, MapPin, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: userProfile?.fullName || '',
    studentId: userProfile?.studentId || '',
    campus: userProfile?.academic.campus || '',
    dept: userProfile?.academic.dept || '',
    course: userProfile?.academic.course || '',
    year: String(userProfile?.academic.year || ''),
    fbLink: userProfile?.contact.fbLink || '',
    mobile: userProfile?.contact.mobile || '',
  });

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const courses = form.dept ? (COURSES[form.dept] || []) : [];

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!studentIdRegex.test(form.studentId)) { setError('Invalid Student ID format.'); return; }
    if (!mobileRegex.test(form.mobile)) { setError('Invalid mobile number.'); return; }
    const fbErr = validateFbLink(form.fbLink);
    if (fbErr) { setError(fbErr); return; }
    setError('');
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userProfile!.uid), {
        fullName: form.fullName.trim(),
        studentId: form.studentId.trim().toUpperCase(),
        contact: { fbLink: ensureUrl(form.fbLink), mobile: form.mobile.trim() },
        academic: { campus: form.campus, dept: form.dept, course: form.course, year: parseInt(form.year) },
      });
      await refreshProfile();
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  const initials = userProfile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="page-header">My Profile</h1>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-emerald-400 text-sm animate-fade-in">
          <CheckCircle2 size={15} /> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="glass-strong p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 flex items-center justify-center text-2xl font-display font-bold text-white shadow-lg shadow-sky-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-100">{userProfile.fullName}</h2>
              <p className="text-sky-400 text-sm font-mono mt-0.5">{userProfile.studentId}</p>
              <div className="flex items-center gap-2 mt-1">
                {userProfile.role === 'admin' ? (
                  <span className="badge-pending"><Shield size={10} /> Admin</span>
                ) : (
                  <span className="badge-open"><User size={10} /> Student</span>
                )}
                <span className="badge-open">Approved</span>
              </div>
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        /* View Mode */
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard icon={BookOpen} label="Academic Info">
            <InfoRow label="Campus" value={userProfile.academic.campus} />
            <InfoRow label="Department" value={`${userProfile.academic.dept} — ${DEPARTMENTS[userProfile.academic.dept] || ''}`} />
            <InfoRow label="Course" value={userProfile.academic.course} />
            <InfoRow label="Year Level" value={`Year ${userProfile.academic.year}`} />
          </InfoCard>
          <InfoCard icon={Phone} label="Contact Info">
            <InfoRow label="Email" value={userProfile.email} />
            <InfoRow label="Mobile" value={userProfile.contact.mobile} />
            <InfoRow label="Facebook" value={
              <a
                href={ensureUrl(userProfile.contact.fbLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 truncate max-w-[180px] flex items-center gap-1.5 transition-colors group"
              >
                <Facebook size={12} className="shrink-0" />
                <span className="truncate">{userProfile.contact.fbLink}</span>
                <ExternalLink size={11} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            } />
          </InfoCard>
        </div>
      ) : (
        /* Edit Mode */
        <div className="glass-strong p-6 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm">Edit Information</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full Name *</label>
              <input className="input-field" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Student ID *</label>
              <input className="input-field font-mono" value={form.studentId} onChange={e => update('studentId', e.target.value.toUpperCase())} maxLength={11} />
            </div>
          </div>

          <div>
            <label className="label-text">Campus *</label>
            <div className="relative">
              <select className="input-field appearance-none pr-9" value={form.campus} onChange={e => update('campus', e.target.value)}>
                {CAMPUSES.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Department *</label>
              <div className="relative">
                <select className="input-field appearance-none pr-9" value={form.dept}
                  onChange={e => { update('dept', e.target.value); update('course', ''); }}>
                  {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k} className="bg-[#0f172a]">{k} — {v}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label-text">Course *</label>
              <div className="relative">
                <select className="input-field appearance-none pr-9" value={form.course} onChange={e => update('course', e.target.value)}>
                  {courses.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Year Level *</label>
              <div className="relative">
                <select className="input-field appearance-none pr-9" value={form.year} onChange={e => update('year', e.target.value)}>
                  {YEAR_LEVELS.map(y => <option key={y} value={y} className="bg-[#0f172a]">Year {y}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label-text">Mobile Number *</label>
              <input className="input-field font-mono" value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="09XXXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="label-text">Facebook Profile Link *</label>
            <input
              type="url"
              className="input-field"
              value={form.fbLink}
              onChange={e => update('fbLink', e.target.value)}
              placeholder="https://facebook.com/yourprofile"
            />
            <p className="text-slate-600 text-xs mt-1">Must be a valid Facebook URL — e.g. https://facebook.com/yourname</p>
            {form.fbLink && /facebook\.com\//i.test(form.fbLink) && (
              <a
                href={ensureUrl(form.fbLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1.5 text-sky-400 hover:text-sky-300 text-xs transition-colors"
              >
                <Facebook size={11} /> ✓ Click to verify this link opens correctly ↗
              </a>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
            <button onClick={() => { setEditing(false); setError(''); }} className="btn-secondary flex items-center gap-2 text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className="text-sky-400" />
        <span className="text-sm font-semibold text-slate-300">{label}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-0.5">{label}</p>
      <div className="text-slate-300 text-sm">{value}</div>
    </div>
  );
}
