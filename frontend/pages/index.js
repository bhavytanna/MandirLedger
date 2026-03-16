import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const THEME_KEY = 'mandirledger_theme_v1';

/* ─── Om Logo SVG (same as Layout) ────────────────────────── */
function OmLogo({ size = 60 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="omGlowH" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"   />
        </radialGradient>
        <linearGradient id="omGradH" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="40%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="templeGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="url(#omGlowH)" />
      <path d="M15 42 Q30 22 45 42" fill="url(#templeGrad3)" opacity="0.85" />
      <ellipse cx="30" cy="18" rx="4" ry="2.5" fill="#fbbf24" />
      <rect x="28.5" y="15" width="3" height="5" rx="1" fill="#fbbf24" />
      <line x1="30" y1="10" x2="30" y2="15" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="9.5" r="1.5" fill="#fbbf24" />
      <rect x="15" y="42" width="30" height="2.5" rx="1" fill="url(#omGradH)" />
      <rect x="16" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGradH)" opacity="0.9" />
      <rect x="26" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGradH)" />
      <rect x="36" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGradH)" opacity="0.9" />
      <rect x="13" y="52.5" width="34" height="2.5" rx="1" fill="url(#omGradH)" />
      <text x="30" y="38" textAnchor="middle" fontSize="14" fill="url(#omGradH)" fontFamily="serif" opacity="0.4">ॐ</text>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: '🪔',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Fully Transparent',
    desc: 'Complete activity logs for every addition, edit, or deletion — nothing is ever hidden from devotees.',
  },
  {
    icon: '🙏',
    color: 'from-rose-400 to-red-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    title: 'Member Ledger',
    desc: 'Profiles, donation history, yearly contribution tracking, and pending amounts per member.',
  },
  {
    icon: '🧾',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'PDF Receipts',
    desc: 'Generate and print official donation receipts instantly for any recorded donation.',
  },
  {
    icon: '🔐',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Secure Access',
    desc: 'Role-based authentication — only authorised temple administrators can manage records.',
  },
  {
    icon: '₹',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'INR Formatted',
    desc: 'All amounts displayed in Indian Rupee format with proper locale formatting.',
  },
  {
    icon: '📊',
    color: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    title: 'Live Dashboard',
    desc: 'Real-time statistics for total donations, members, and pending contributions.',
  },
];

const STATS = [
  { value: '100%', label: 'Transparent' },
  { value: 'ॐ',   label: 'Divinely Blessed' },
  { value: '₹',   label: 'INR Tracked'   },
  { value: '🔒',  label: 'Secure & Safe' },
];

export default function Landing() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved   = window.localStorage.getItem(THEME_KEY);
      const initial = saved === 'dark' ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <div className="min-h-screen bg-[#fff8ee] dark:bg-[#0A0612] transition-colors duration-300 overflow-x-hidden">
      <div className="app-bg" />

      {/* ── Top Navigation Bar ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 sacred-header">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="om-pulse group-hover:scale-110 transition-transform duration-300">
              <OmLogo size={34} />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-extrabold text-xl tracking-tight gradient-text"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MandirLedger
              </span>
              <span className="text-[9px] text-amber-600/70 dark:text-amber-400/60 tracking-widest font-semibold uppercase hidden sm:block">
                ॐ  Temple Donation & Ledger System
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-amber-600 dark:text-amber-400
                         bg-amber-50/80 dark:bg-amber-900/20
                         hover:bg-amber-100 dark:hover:bg-amber-900/35
                         border border-amber-200/70 dark:border-amber-700/30
                         transition-all duration-200"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link href="/login" className="btn-primary text-sm px-3 sm:px-4 py-2">
              🙏 Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 sm:px-5 pt-16 pb-10 text-center animate-slideUp">

        {/* Floating lotus petals decoration */}
        <div className="absolute top-8 left-8 text-4xl opacity-20 dark:opacity-10 animate-float select-none">🪷</div>
        <div className="absolute top-20 right-10 text-3xl opacity-15 dark:opacity-10 animate-float select-none" style={{ animationDelay: '1.5s' }}>🌸</div>
        <div className="absolute top-4 right-1/4 text-2xl opacity-10 dark:opacity-5 animate-float select-none" style={{ animationDelay: '3s' }}>✨</div>

        {/* Divine badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6
                        bg-gradient-to-r from-amber-100 to-orange-100
                        dark:from-amber-900/30 dark:to-orange-900/20
                        border border-amber-300/50 dark:border-amber-700/30
                        text-amber-800 dark:text-amber-300 text-xs font-bold
                        shadow-sm">
          <span className="flame">🪔</span>
          <span className="tracking-wide">Temple Donation & Contribution Management</span>
          <span className="flame" style={{ animationDelay: '0.6s' }}>🪔</span>
        </div>

        {/* Main logo + title */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative divine-ring rounded-full p-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
            <div className="om-pulse">
              <OmLogo size={90} />
            </div>
          </div>
          <div className="w-full max-w-[260px] sm:max-w-[320px] md:max-w-none mx-auto">
            <h1
              className="w-full max-w-full text-[clamp(1.45rem,7.6vw,2.25rem)] sm:text-5xl md:text-7xl font-extrabold tracking-[-0.02em] sm:tracking-tight leading-[1.02] sm:leading-tight gradient-text divine-glow px-2 whitespace-normal"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              MandirLedger
            </h1>
            <p className="mt-2 text-base md:text-lg font-semibold text-amber-700/80 dark:text-amber-400/80 tracking-widest">
              ✦ Transparent · Accountable · Blessed ✦
            </p>
          </div>
        </div>

        {/* Sanskrit slogan */}
        <div className="lotus-divider max-w-sm mx-auto mb-5">
          <span>🔱</span>
        </div>

        <p className="text-stone-600 dark:text-stone-300 max-w-xl mx-auto text-base leading-relaxed mb-4">
          A complete sacred ledger for temple donations, member contributions, and financial transparency.
          Every offering is honoured. Every rupee is tracked with devotion.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-14">
          <Link href="/contributor" className="btn-primary text-base px-7 py-3.5 rounded-xl w-full sm:w-auto justify-center">
            <span className="flame">🪔</span>
            Make a Donation
          </Link>
          <Link href="/dashboard" className="btn-secondary text-base px-7 py-3.5 rounded-xl w-full sm:w-auto justify-center">
            <svg viewBox="0 0 20 20" width="17" height="17" fill="currentColor">
              <path d="M2 4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3zm9-9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
            </svg>
            View Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="divine-card p-4 text-center">
              <div className="text-2xl font-black gradient-text mb-1">{s.value}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="text-center mb-10">
          <div className="lotus-divider max-w-xs mx-auto mb-3"><span>🪷</span></div>
          <h2
            className="text-2xl md:text-3xl font-bold gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Sacred Features
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">
            Built with devotion — every feature serves the temple community
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="divine-card p-6 text-left"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center text-2xl mb-4
                              bg-gradient-to-br ${f.color} bg-opacity-10`}>
                <span>{f.icon}</span>
              </div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-amber-100/50 dark:border-amber-900/20 py-8">
        <div className="max-w-7xl mx-auto px-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <OmLogo size={22} />
            <span
              className="text-base font-bold gradient-text"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              MandirLedger
            </span>
          </div>
          <div className="lotus-divider max-w-xs mx-auto"><span>🪷</span></div>
          <p className="text-xs text-stone-400 dark:text-stone-600 font-medium tracking-widest mt-2">
            ॐ सर्वे भवन्तु सुखिनः · सर्वे सन्तु निरामयाः
          </p>
          <p className="text-xs text-stone-300 dark:text-stone-700">
            May all beings be happy · May all be free from illness
          </p>
          <div className="pt-4 mt-2 border-t border-amber-100/30 dark:border-amber-900/10 max-w-[200px] mx-auto">
             <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
               Created by <span className="text-amber-600 dark:text-amber-500 font-bold">Bhavy Tanna</span>
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
