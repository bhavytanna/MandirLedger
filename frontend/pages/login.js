import { useState } from 'react';
import Layout from '../components/Layout';
import Alert from '../components/Alert';
import { apiRequest } from '../lib/api';
import { setAuth } from '../lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', { method: 'POST', body: { username, password } });
      setAuth({ token: res.token, user: res.user });
      window.location.href = '/dashboard';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Sign In">
      <div className="min-h-[60vh] flex items-center justify-center -mt-4">
        <div className="w-full max-w-md animate-slideUp">
          {/* Card */}
          <div className="bg-white/90 dark:bg-[#1a1232]/90 rounded-2xl shadow-saffron dark:shadow-amber-900/20
                          border border-amber-100/70 dark:border-amber-900/25 overflow-hidden backdrop-blur-sm">
            {/* Top gradient band */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                bg-gradient-to-br from-amber-400 to-red-500 shadow-saffron mb-4">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
                    <path d="M12 22V12" />
                    <path d="M2 7l10 5 10-5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to MandirLedger</p>
              </div>

              <div className="space-y-4">
                <Alert message={error} />

                {/* Username field */}
                <div>
                  <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 uppercase tracking-wide">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="viewer / editor"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm
                                 bg-white dark:bg-[#0f0a1e]/50
                                 border-amber-100 dark:border-amber-900/30
                                 text-gray-800 dark:text-gray-100 placeholder:text-gray-400
                                 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500
                                 focus:ring-4 focus:ring-amber-400/15
                                 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl border-2 text-sm
                                 bg-white dark:bg-[#0f0a1e]/50
                                 border-amber-100 dark:border-amber-900/30
                                 text-gray-800 dark:text-gray-100
                                 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500
                                 focus:ring-4 focus:ring-amber-400/15
                                 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      {showPw ? (
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  disabled={loading}
                  onClick={handleLogin}
                  className="w-full btn-primary py-3 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Sign In
                    </span>
                  )}
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
                Use <span className="font-mono bg-amber-50 dark:bg-amber-900/20 px-1 rounded text-amber-700 dark:text-amber-400">viewer</span> or{' '}
                <span className="font-mono bg-amber-50 dark:bg-amber-900/20 px-1 rounded text-amber-700 dark:text-amber-400">editor</span> credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
