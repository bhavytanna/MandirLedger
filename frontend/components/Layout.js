import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clearAuth, getUser } from '../lib/auth';

const THEME_KEY = 'mandirledger_theme_v1';

/* ─── Sacred Om SVG Logo ──────────────────────────────────── */
function OmLogo({ size = 36 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="omGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"   />
        </radialGradient>
        <linearGradient id="omGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="40%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        {/* Temple silhouette gradient */}
        <linearGradient id="templeGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* Glow circle */}
      <circle cx="30" cy="30" r="28" fill="url(#omGlow)" />
      {/* Temple body */}
      <path d="M15 42 Q30 22 45 42" fill="url(#templeGrad2)" opacity="0.85" />
      {/* Shikhara spire */}
      <ellipse cx="30" cy="18" rx="4" ry="2.5" fill="#fbbf24" />
      <rect x="28.5" y="15" width="3" height="5" rx="1" fill="#fbbf24" />
      <line x1="30" y1="10" x2="30" y2="15" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="9.5" r="1.5" fill="#fbbf24" />
      {/* Temple base */}
      <rect x="15" y="42" width="30" height="2.5" rx="1" fill="url(#omGrad)" />
      {/* Pillars */}
      <rect x="16" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGrad)" opacity="0.9" />
      <rect x="26" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGrad)" />
      <rect x="36" y="44.5" width="4"   height="8" rx="0.5" fill="url(#omGrad)" opacity="0.9" />
      {/* Ground line */}
      <rect x="13" y="52.5" width="34" height="2.5" rx="1" fill="url(#omGrad)" />
      {/* Om symbol overlay */}
      <text x="30" y="38" textAnchor="middle" fontSize="14" fill="url(#omGrad)" fontFamily="serif" opacity="0.4">ॐ</text>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
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

/* ─── Nav Items ──────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path d="M2 4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3zm9-9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V4zm0 9a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3z" />
      </svg>
    ),
  },
  {
    href: '/members',
    label: 'Members',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: '/donations',
    label: 'Donations',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 2a1 1 0 100 2 1 1 0 000-2z" />
      </svg>
    ),
  },
  {
    href: '/pending',
    label: 'Pending',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/activity-logs',
    label: 'Activity',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'About',
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function NavLink({ href, label, icon }) {
  const router = useRouter();
  const active = router.pathname === href || router.pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative
        ${active
          ? 'text-amber-700 dark:text-amber-300 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 shadow-sm'
          : 'text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-900/15'}
      `}
    >
      <span className={`transition-colors ${active ? 'text-amber-600 dark:text-amber-400' : ''}`}>{icon}</span>
      {label}
      {active && (
        <span className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-400" />
      )}
    </Link>
  );
}

export default function Layout({ title, children }) {
  const [user, setUser]         = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [theme, setTheme]       = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setUserReady(true);
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

  const userInitial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#fff8ee] dark:bg-[#0A0612]">
      <div className="app-bg" />

      {/* ── Sacred Glass Header ────────────────────────────── */}
      <header className="sticky top-0 z-50 sacred-header">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="om-pulse transition-transform duration-300 group-hover:scale-110">
              <OmLogo size={38} />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-extrabold text-lg tracking-tight gradient-text"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MandirLedger
              </span>
              <span className="text-[9px] text-amber-600/70 dark:text-amber-400/60 font-semibold tracking-widest uppercase hidden sm:block">
                ॐ  Temple Donation & Contribution Ledger
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} />
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-amber-600 dark:text-amber-400
                         bg-amber-50/80 dark:bg-amber-900/20
                         hover:bg-amber-100 dark:hover:bg-amber-900/35
                         border border-amber-200/70 dark:border-amber-700/30
                         transition-all duration-200 hover:shadow-sm"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* User / logout */}
            {userReady && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
                                bg-gradient-to-r from-amber-50 to-orange-50
                                dark:from-amber-900/20 dark:to-orange-900/15
                                border border-amber-200/50 dark:border-amber-700/25">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500
                                  flex items-center justify-center text-white text-xs font-bold
                                  shadow-sm ring-1 ring-amber-300/50">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full
                                   bg-gradient-to-r from-amber-400/20 to-orange-400/20
                                   dark:from-amber-800/40 dark:to-orange-800/30
                                   text-amber-700 dark:text-amber-400 font-bold capitalize border border-amber-300/30">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => { clearAuth(); window.location.href = '/login'; }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                             text-red-600 dark:text-red-400
                             bg-red-50/80 dark:bg-red-900/15
                             hover:bg-red-100 dark:hover:bg-red-900/30
                             border border-red-200/50 dark:border-red-800/25
                             transition-all duration-200"
                >
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                    <path fillRule="evenodd" d="M3 8a1 1 0 011-1h8V5a1 1 0 011.707-.707l4 4a1 1 0 010 1.414l-4 4A1 1 0 0113 13v-2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 000-2H4V6h5a1 1 0 000-2H3z" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-xs px-3 py-1.5">
                🙏 Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-amber-600 dark:text-amber-400
                         hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                {menuOpen
                  ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-amber-100/60 dark:border-amber-900/20 pt-2 grid grid-cols-2 gap-1 animate-fadeIn">
            {NAV_ITEMS.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} />
            ))}
          </div>
        )}
      </header>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-7">
        <div className="mb-6 flex items-center justify-between animate-slideUp">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">{title}</h1>
            <div className="mt-1 h-0.5 w-14 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-400" />
          </div>
          {userReady && !user && (
            <div className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Not logged in
            </div>
          )}
        </div>

        <div className="animate-fadeIn">{children}</div>
      </main>

      {/* ── Sacred Footer ─────────────────────────────────── */}
      <footer className="mt-16 border-t border-amber-100/50 dark:border-amber-900/20 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 dark:text-stone-600">
          <div className="flex items-center gap-1.5">
            <OmLogo size={16} />
            <span>MandirLedger — <span className="gradient-text font-semibold">Transparent. Accountable. Blessed.</span></span>
          </div>
          <div className="flex flex-col items-center gap-1 mt-2 sm:mt-0">
            <div className="lotus-divider w-48 sm:w-24">
              <span>🪷</span>
            </div>
            <span className="font-medium">Created by <span className="text-amber-600 dark:text-amber-500 font-bold">Bhavy Tanna</span></span>
          </div>
          <span>ॐ सर्वे भवन्तु सुखिनः</span>
        </div>
      </footer>
    </div>
  );
}
