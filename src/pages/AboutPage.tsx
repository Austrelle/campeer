// src/pages/AboutPage.tsx
import { Github, BookOpen, Zap, Users, Shield } from 'lucide-react';

const creators = [
  {
    name: 'Xeena',
    role: 'Lead Developer & System Architect',
    desc: 'Spearheaded the system architecture and full-stack development of CAMPEER, ensuring robust and scalable code.',
    gradient: 'from-sky-500 to-blue-600',
    initials: 'XE',
    image: '/team/c.jpg',
  },
  {
    name: 'Austrelle',
    role: 'UI/UX Designer & Frontend Developer',
    desc: 'Designed the CAMPEER visual identity and glassmorphism UI system, crafting every pixel for clarity and elegance.',
    gradient: 'from-violet-500 to-purple-600',
    initials: 'AU',
    image: '/team/n.jpg',
  },
  {
    name: 'Forge',
    role: 'Backend Developer & Database Engineer',
    desc: 'Engineered the Firebase backend, real-time listeners, and secure data architecture powering the marketplace.',
    gradient: 'from-emerald-500 to-teal-600',
    initials: 'FO',
    image: '/team/i.jpg',
  },
];

const features = [
  { icon: BookOpen, title: 'Academic Marketplace', desc: 'Browse and post tasks for all JRMSU academic subjects and disciplines.' },
  { icon: Shield, title: 'Verified Community', desc: 'All users are verified JRMSU students — a trusted, safe academic network.' },
  { icon: Zap, title: 'Real-time Updates', desc: 'Firebase-powered live feed means you see new tasks the moment they\'re posted.' },
  { icon: Users, title: 'Peer-to-Peer Earning', desc: 'Earn money helping classmates while building skills in your area of expertise.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="campeer-logo text-5xl sm:text-6xl mb-3">CAMPEER</h1>
        <p className="text-slate-300 text-lg font-display">Campus Academic Marketplace for Peer Exchange and Earning Resources</p>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
          CAMPEER connects JRMSU students who need academic help with talented peers who can provide it 
          creating a verified, trusted, and rewarding campus marketplace.
        </p>
      </div>

      {/* Mission */}
      <div className="glass-strong p-6 sm:p-8">
        <h2 className="text-xl font-display font-bold text-slate-100 mb-3">Our Mission</h2>
        <p className="text-slate-400 leading-relaxed">
          CAMPEER was built with a simple but powerful idea: every JRMSU student has skills that other students need. 
          Whether it's programming expertise, research ability, or subject mastery those skills have real value. 
          Our platform bridges the gap, creating an ethical academic marketplace where students can earn, learn, and grow together.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-100 mb-4">Key Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(f => (
            <div key={f.title} className="glass-card p-5">
              <f.icon size={20} className="text-sky-400 mb-3" />
              <h3 className="font-semibold text-slate-200 mb-1.5">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-100 mb-2">Meet the Team</h2>
        <p className="text-slate-500 text-sm mb-5">The passionate developers behind CAMPEER</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {creators.map(c => (
            <div key={c.name} className="glass-card p-6 text-center flex flex-col items-center">
              {/* Avatar — Replace with actual img when available */}
              <div className="mb-4 relative">
                {c.image ? (
                  <img src={c.image} alt={c.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl" />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-3xl font-display font-bold text-white shadow-xl`}>
                    {c.initials}
                  </div>
                )}
                <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${c.gradient} border-2 border-[#020617] flex items-center justify-center`}>
                  <Zap size={11} className="text-white" />
                </div>
              </div>
              <h3 className="font-display font-bold text-slate-100 text-lg">{c.name}</h3>
              <p className="text-sky-400 text-xs font-medium mt-1 mb-3">{c.role}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        
      </div>

      {/* Tech Stack */}
      <div className="glass p-6">
        <h2 className="text-lg font-display font-bold text-slate-200 mb-4">Built With</h2>
        <div className="flex flex-wrap gap-2">
          {['React + TypeScript', 'Firebase Auth', 'Cloud Firestore', 'Tailwind CSS', 'Vite', 'React Router', 'Lucide Icons', 'date-fns'].map(t => (
            <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-400 text-sm rounded-full">{t}</span>
          ))}
        </div>
      </div>

    
    </div>
  );
}
