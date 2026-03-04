// src/components/UserProfileModal.tsx
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { DEPARTMENTS, ensureUrl } from '../utils/constants';
import {
  X, User, BookOpen, MapPin, GraduationCap, Phone,
  Facebook, Shield, ExternalLink, Loader2
} from 'lucide-react';

interface Props {
  userId: string;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [userId]);

  const initials = profile?.fullName
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-scale-in" style={{ zIndex: 51 }}>
        <div className="glass-strong shadow-2xl shadow-black/60 overflow-hidden">

          {/* Header strip */}
          <div className="h-20 bg-gradient-to-r from-sky-600/30 via-blue-600/20 to-violet-600/30 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-slate-300 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-sky-400 animate-spin" />
            </div>
          ) : !profile ? (
            <div className="py-12 text-center text-slate-500">User not found.</div>
          ) : (
            <div className="px-6 pb-6">
              {/* Avatar overlapping header */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600
                                flex items-center justify-center text-2xl font-display font-bold text-white
                                ring-4 ring-[#0f172a] shadow-xl shadow-sky-500/20">
                  {initials}
                </div>
                {profile.role === 'admin' && (
                  <span className="badge-pending flex items-center gap-1 mb-1">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>

              {/* Name & ID */}
              <h2 className="text-xl font-display font-bold text-white leading-tight">{profile.fullName}</h2>
              <p className="text-sky-400 text-sm font-mono mt-0.5">{profile.studentId}</p>

              <div className="mt-5 space-y-4">
                {/* Academic */}
                <Section icon={BookOpen} title="Academic Info">
                  <Row label="Campus"     value={profile.academic.campus} />
                  <Row label="Department" value={`${profile.academic.dept} — ${DEPARTMENTS[profile.academic.dept] || ''}`} />
                  <Row label="Course"     value={profile.academic.course} />
                  <Row label="Year Level" value={`Year ${profile.academic.year}`} />
                </Section>

                {/* Contact — public info only */}
                <Section icon={Phone} title="Contact">
                  <Row label="Email" value={profile.email} />
                  {profile.contact?.mobile && (
                    <Row label="Mobile" value={profile.contact.mobile} />
                  )}
                  {profile.contact?.fbLink && (
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-1">Facebook</p>
                      <a
                        href={ensureUrl(profile.contact.fbLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 w-full rounded-lg
                                   bg-sky-500/8 border border-sky-500/20 hover:bg-sky-500/15
                                   hover:border-sky-500/35 transition-all group"
                      >
                        <Facebook size={14} className="text-sky-400 shrink-0" />
                        <span className="text-sky-300 text-sm truncate flex-1">{profile.contact.fbLink}</span>
                        <ExternalLink size={12} className="text-sky-400/60 shrink-0 group-hover:text-sky-400 transition-colors" />
                      </a>
                    </div>
                  )}
                </Section>
              </div>

              <button
                onClick={onClose}
                className="btn-secondary w-full mt-5 text-sm flex items-center justify-center gap-2"
              >
                <X size={14} /> Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-sky-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-0.5">{label}</p>
      <p className="text-slate-300 text-sm">{value}</p>
    </div>
  );
}
