// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CAMPUSES, DEPARTMENTS, COURSES, YEAR_LEVELS, studentIdRegex, mobileRegex, validateFbLink, ensureUrl } from '../utils/constants';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: '',
    dept: '',
    course: '',
    year: '',
    fbLink: '',
    mobile: '',
  });

  const update = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));

  const courses = form.dept ? (COURSES[form.dept] || []) : [];

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.studentId.trim()) return 'Student ID is required.';
    if (!studentIdRegex.test(form.studentId)) return 'Invalid Student ID format. Use: 24-A-01241';
    if (!form.email.trim()) return 'Email is required.';
    if (!form.email.includes('@')) return 'Invalid email address.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const validateStep2 = () => {
    if (!form.campus) return 'Please select your campus.';
    if (!form.dept) return 'Please select your department.';
    if (!form.course) return 'Please select your course.';
    if (!form.year) return 'Please select your year level.';
    return '';
  };

  const validateStep3 = () => {
    const fbErr = validateFbLink(form.fbLink);
    if (fbErr) return fbErr;
    if (!form.mobile.trim()) return 'Mobile number is required.';
    if (!mobileRegex.test(form.mobile)) return 'Invalid mobile number. Use: 09XXXXXXXXX';
    return '';
  };

  const nextStep = () => {
    const validators: Record<Step, () => string> = { 1: validateStep1, 2: validateStep2, 3: validateStep3 };
    const err = validators[step]();
    if (err) { setError(err); return; }
    setError('');
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) { setError('Please accept the Terms of Use to continue.'); return; }
    const err = validateStep3();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.email.trim(), form.password, {
        fullName: form.fullName.trim(),
        studentId: form.studentId.trim().toUpperCase(),
        contact: { fbLink: ensureUrl(form.fbLink), mobile: form.mobile.trim() },
        academic: {
          campus: form.campus,
          dept: form.dept,
          course: form.course,
          year: parseInt(form.year),
        },
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered.' : err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-2">Registration Submitted!</h2>
          <p className="text-slate-400 text-sm mb-4">Your account is pending admin approval. You'll be able to log in once approved.</p>
          <div className="badge-pending mx-auto w-fit">Awaiting Admin Approval</div>
          <p className="text-slate-600 text-xs mt-6">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const stepLabels = ['Account', 'Academic', 'Contact'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-sky-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="campeer-logo-hero text-5xl sm:text-6xl mb-2" style={{ lineHeight: 1.1, overflow: 'visible' }}>CAMPEER</h1>
          <p className="text-slate-400 text-sm">Create your student account</p>
        </div>

        <div className="glass-strong p-7 shadow-2xl shadow-black/40">
          {/* Stepper */}
          <div className="flex items-center mb-7">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${i + 1 < step ? 'bg-sky-500 border-sky-500 text-white'
                      : i + 1 === step ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                        : 'border-white/20 text-slate-600'}`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${i + 1 === step ? 'text-sky-400' : 'text-slate-600'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-2 mb-4 ${i + 1 < step ? 'bg-sky-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Account Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label-text">Full Name *</label>
                <input className="input-field" value={form.fullName} onChange={e => update('fullName', e.target.value)}
                  placeholder="Juan dela Cruz" />
              </div>
              <div>
                <label className="label-text">Student ID * <span className="text-slate-600 lowercase tracking-normal">(format: 24-A-01241)</span></label>
                <input className="input-field font-mono" value={form.studentId} onChange={e => update('studentId', e.target.value.toUpperCase())}
                  placeholder="24-A-01241" maxLength={11} />
              </div>
              <div>
                <label className="label-text">Email Address *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="you@jrmsu.edu.ph" />
              </div>
              <div>
                <label className="label-text">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input-field pr-11" value={form.password}
                    onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-text">Confirm Password *</label>
                <input type="password" className="input-field" value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter password" />
              </div>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label-text">Campus *</label>
                <div className="relative">
                  <select className="input-field appearance-none pr-9" value={form.campus} onChange={e => update('campus', e.target.value)}>
                    <option value="">Select Campus</option>
                    {CAMPUSES.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="label-text">Department *</label>
                <div className="relative">
                  <select className="input-field appearance-none pr-9" value={form.dept}
                    onChange={e => { update('dept', e.target.value); update('course', ''); }}>
                    <option value="">Select Department</option>
                    {Object.entries(DEPARTMENTS).map(([k, v]) => (
                      <option key={k} value={k} className="bg-[#0f172a]">{k} — {v}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="label-text">Course *</label>
                <div className="relative">
                  <select className="input-field appearance-none pr-9" value={form.course} onChange={e => update('course', e.target.value)}
                    disabled={!form.dept}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="label-text">Year Level *</label>
                <div className="relative">
                  <select className="input-field appearance-none pr-9" value={form.year} onChange={e => update('year', e.target.value)}>
                    <option value="">Select Year Level</option>
                    {YEAR_LEVELS.map(y => <option key={y} value={y} className="bg-[#0f172a]">Year {y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-500/8 border border-sky-500/20 rounded-xl">
                <p className="text-sky-400 text-xs">🔒 Your contact details are hidden from other users until you claim a task.</p>
              </div>
              <div>
                <label className="label-text">Facebook Profile Link *</label>
                <input
                  className="input-field"
                  type="url"
                  value={form.fbLink}
                  onChange={e => update('fbLink', e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                />
                <p className="text-slate-600 text-xs mt-1">Must start with https://facebook.com/…</p>
                {/* Live clickable preview */}
                {form.fbLink && /facebook\.com\//i.test(form.fbLink) && (
                  <a
                    href={form.fbLink.startsWith('http') ? form.fbLink : `https://${form.fbLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-sky-400 hover:text-sky-300 text-xs transition-colors"
                  >
                    ✓ Link looks good — click to verify it opens correctly ↗
                  </a>
                )}
              </div>
              <div>
                <label className="label-text">Mobile Number * <span className="text-slate-600 lowercase tracking-normal">(e.g. 09123456789)</span></label>
                <input className="input-field font-mono" value={form.mobile} onChange={e => update('mobile', e.target.value)}
                  placeholder="09XXXXXXXXX" maxLength={11} />
              </div>
              <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                <p className="text-amber-400/80 text-xs">⏳ After submitting, your account requires admin approval before you can log in.</p>
              </div>

              {/* Terms checkbox */}
              <div
                onClick={() => setAgreedToTerms(v => !v)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none
                  ${agreedToTerms
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : 'bg-white/3 border-white/10 hover:border-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                  ${agreedToTerms ? 'bg-sky-500 border-sky-500' : 'border-slate-500 bg-transparent'}`}>
                  {agreedToTerms && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors font-medium">
                    Terms of Use
                  </a>
                  {' '}and confirm I will use CAMPEER responsibly and ethically as a JRMSU student.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-7">
            {step > 1 && (
              <button onClick={() => { setStep((step - 1) as Step); setError(''); }} className="btn-secondary flex-1">
                Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={nextStep} className="btn-primary flex-1">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !agreedToTerms}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 transition-all
                  ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}