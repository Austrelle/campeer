// src/pages/TermsPage.tsx
import { Shield, AlertTriangle, CheckCircle, XCircle, BookOpen, Users, Scale, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 py-2">

      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/25
                        flex items-center justify-center mx-auto mb-4">
          <Scale size={24} className="text-sky-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 mb-2">
          Terms of Use
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Last updated: March 2026 · Effective immediately upon registration
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-4 sm:p-5 bg-amber-500/8 border border-amber-500/25 rounded-2xl flex gap-3">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 font-semibold text-sm mb-1">Important Disclaimer</p>
          <p className="text-amber-400/80 text-xs sm:text-sm leading-relaxed">
            CAMPEER is a peer collaboration and tutoring platform. The developers do <strong>not</strong> condone,
            encourage, or support academic dishonesty in any form. Users are solely responsible
            for ensuring their activities comply with JRMSU's academic integrity policies.
          </p>
        </div>
      </div>

      {/* Section 1 */}
      <Section icon={BookOpen} title="1. What is CAMPEER?">
        <p>
          CAMPEER (Campus Academic Marketplace for Peer Exchange and Earning Resources) is a
          student-built platform that connects Jose Rizal Memorial State University (JRMSU) students
          for academic collaboration, peer tutoring, and skill-based assistance.
        </p>
        <p className="mt-2">
          CAMPEER operates similarly to freelancing platforms like Fiverr or Upwork, but exclusively
          for verified JRMSU students. The platform serves as a <strong className="text-slate-300">neutral marketplace</strong> —
          we do not participate in, oversee, or take responsibility for the transactions and
          agreements made between users.
        </p>
      </Section>

      {/* Section 2 */}
      <Section icon={CheckCircle} title="2. Acceptable Use">
        <p className="text-slate-400 text-sm mb-3">The following are encouraged and acceptable uses of CAMPEER:</p>
        <ul className="space-y-2">
          {[
            'Peer tutoring and academic coaching',
            'Study group coordination and collaboration',
            'Requesting help understanding difficult concepts',
            'Proofreading, editing, and feedback on your own work',
            'Research assistance and guidance',
            'Skill sharing (programming help, design, math, etc.)',
            'Project collaboration between students',
            'Note sharing and academic resource exchange',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
              <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Section 3 */}
      <Section icon={XCircle} title="3. Prohibited Activities">
        <p className="text-slate-400 text-sm mb-3">The following are strictly prohibited on CAMPEER:</p>
        <ul className="space-y-2">
          {[
            'Submitting another person\'s work as your own to instructors or professors',
            'Paying someone to complete graded assignments, exams, or quizzes on your behalf',
            'Cheating, plagiarism, or any form of academic fraud as defined by JRMSU policies',
            'Harassment, bullying, or threatening behavior toward other users',
            'Sharing false information or impersonating other students',
            'Using the platform for illegal transactions or activities',
            'Scamming or defrauding other users of payment or services',
            'Sharing another user\'s personal contact information without consent',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
              <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Section 4 */}
      <Section icon={Users} title="4. User Responsibilities">
        <p>
          By registering and using CAMPEER, you agree that:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            'You are a currently enrolled JRMSU student with a valid Student ID',
            'All information provided during registration is accurate and truthful',
            'You are solely responsible for your actions and transactions on the platform',
            'You will use the platform in accordance with JRMSU\'s Code of Student Conduct',
            'You understand that CAMPEER developers are not liable for disputes between users',
            'You will not hold the developers responsible for how you or others use the platform',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Section 5 */}
      <Section icon={Shield} title="5. Developer Liability Disclaimer">
        <div className="p-4 bg-sky-500/6 border border-sky-500/20 rounded-xl">
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            The developers of CAMPEER — <strong className="text-sky-400">Austrelle, Xeena, and Forge</strong> —
            built this platform as a student project to promote peer collaboration and academic support
            within the JRMSU community.
          </p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-3">
            We are <strong className="text-slate-300">not responsible</strong> for:
          </p>
          <ul className="mt-2 space-y-1.5">
            {[
              'How individual users choose to use the platform',
              'Disputes, fraud, or misconduct between users',
              'Academic consequences resulting from misuse of the platform',
              'Content posted by users on the platform',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-500">
                <div className="w-1 h-1 rounded-full bg-slate-600 shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-3">
            CAMPEER is a <strong className="text-slate-300">neutral platform</strong> — comparable to how
            Facebook Messenger is not responsible for the conversations users have on it.
            The responsibility of ethical use lies entirely with the individual user.
          </p>
        </div>
      </Section>

      {/* Section 6 */}
      <Section icon={Shield} title="6. Privacy & Data">
        <p>
          Your personal information (name, Student ID, contact details) is stored securely in
          Firebase and is only accessible to:
        </p>
        <ul className="mt-3 space-y-2">
          {[
            'Yourself — you can view and edit your own profile',
            'Platform admins — for account verification and moderation only',
            'Other users — only your name is visible publicly; contact details are only revealed when a task is claimed',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs sm:text-sm">
          We do not sell, share, or distribute your personal data to any third parties.
        </p>
      </Section>

      {/* Section 7 */}
      <Section icon={AlertTriangle} title="7. Account Termination">
        <p>
          CAMPEER administrators reserve the right to suspend or permanently delete any account
          that violates these Terms of Use, engages in misconduct, or misuses the platform —
          without prior notice.
        </p>
      </Section>

      {/* Section 8 */}
      <Section icon={Scale} title="8. Changes to These Terms">
        <p>
          These Terms of Use may be updated at any time. Continued use of CAMPEER after changes
          are posted constitutes acceptance of the revised terms. It is your responsibility to
          review these terms periodically.
        </p>
      </Section>

      {/* Contact */}
      <div className="glass p-5 sm:p-6 rounded-2xl text-center">
        <Mail size={20} className="text-sky-400 mx-auto mb-2" />
        <h3 className="font-display font-semibold text-slate-200 text-sm mb-1">Questions or Concerns?</h3>
        <p className="text-slate-500 text-xs sm:text-sm">
          If you have questions about these Terms of Use, please submit a report through the{' '}
          <Link to="/feedback" className="text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-2">
            Feedback page
          </Link>.
        </p>
      </div>

      {/* Agreement footer */}
      <div className="text-center pb-4">
        <p className="text-slate-600 text-xs leading-relaxed">
          By using CAMPEER, you acknowledge that you have read, understood, and agree to these Terms of Use.
          <br />© 2025 CAMPEER — Developed by Austrelle, Xeena & Forge · JRMSU
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: any; title: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-strong p-5 sm:p-6 rounded-2xl">
      <div className="flex items-center gap-2.5 mb-3">
        <Icon size={16} className="text-sky-400 shrink-0" />
        <h2 className="font-display font-bold text-slate-200 text-sm sm:text-base">{title}</h2>
      </div>
      <div className="text-slate-400 text-xs sm:text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}