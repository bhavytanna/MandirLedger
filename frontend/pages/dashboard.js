import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Alert from '../components/Alert';
import { apiRequest } from '../lib/api';
import { formatINR, formatDateTime } from '../lib/format';
import { useRequireAuth } from '../lib/requireAuth';

const STAT_CARDS = [
  {
    key: 'members',
    title: 'Total Members',
    subtitle: 'Active (not archived)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-t-amber-400',
    getValue: (data) => data?.totals?.members ?? '—',
  },
  {
    key: 'donations',
    title: 'Total Donations',
    subtitle: 'All time',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-t-green-400',
    getValue: (data) => data ? formatINR(data.totals.donations_amount) : '—',
  },
  {
    key: 'pending',
    title: 'Pending Contributions',
    subtitle: 'For current year',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'from-rose-400 to-red-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-t-rose-400',
    getValue: (data) => data ? formatINR(data.totals.pending_contributions_amount) : '—',
  },
];

export default function Dashboard() {
  const { ready, user } = useRequireAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function reload() {
    const res = await apiRequest('/api/dashboard');
    setData(res);
  }

  useEffect(() => {
    if (!ready) return;
    setError('');
    reload().catch((e) => setError(e.message));
  }, [ready]);

  return (
    <Layout title="Dashboard">
      <div className="space-y-5">
        <Alert message={error} />

        {/* Stat cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {STAT_CARDS.map((s) => (
            <div
              key={s.key}
              className={`
                bg-white/90 dark:bg-[#1a1232]/80 rounded-2xl
                border-2 border-t-2 ${s.borderColor}
                border-l-amber-100/40 border-r-amber-100/40 border-b-amber-100/40
                dark:border-l-amber-900/20 dark:border-r-amber-900/20 dark:border-b-amber-900/20
                shadow-card dark:shadow-card-dark backdrop-blur-sm p-5
                hover:shadow-saffron transition-all duration-300 hover:-translate-y-0.5
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {s.title}
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                    {s.getValue(data)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.subtitle}</div>
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.iconColor} flex items-center justify-center flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Danger zone for editor */}
        {user?.role === 'editor' ? (
          <div className="flex justify-end">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         text-red-600 dark:text-red-400
                         bg-red-50 dark:bg-red-900/10
                         border border-red-200/60 dark:border-red-800/30
                         hover:bg-red-100 dark:hover:bg-red-900/20
                         transition-all duration-200"
              onClick={async () => {
                if (!confirm('Wipe ALL data? This will permanently delete members, donations, receipts, logs, and reset counters.')) return;
                const text = prompt('Type WIPE to confirm');
                if (text !== 'WIPE') return;
                setError('');
                try {
                  await apiRequest('/api/admin/wipe', { method: 'POST', body: { confirm: 'WIPE' } });
                  await reload();
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Wipe all data
            </button>
          </div>
        ) : null}

        {/* Recent Donations */}
        <Card
          title="Recent Donations"
          accent="amber"
          footer={
            <div className="flex items-center justify-between">
              <Link href="/donations" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
                View all donations
              </Link>
              {user?.role !== 'viewer' && (
                <Link
                  href="/donations/new"
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  + Add donation
                </Link>
              )}
            </div>
          }
        >
          <div className="divide-y divide-amber-50 dark:divide-amber-900/15">
            {(data?.recent_donations || []).map((d) => {
              const initial = d.donor_name?.[0]?.toUpperCase() || '?';
              return (
                <div key={d.donation_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                                    flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{d.donor_name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {d.donation_id}{d.member_id ? ` • ${d.member_id}` : ''} • {formatDateTime(d.donated_at)}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-amber-600 dark:text-amber-400 text-sm whitespace-nowrap">
                    {formatINR(d.amount)}
                  </div>
                </div>
              );
            })}
            {data?.recent_donations?.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No donations recorded yet.
              </div>
            )}
            {!data && (
              <div className="py-6 flex flex-col gap-2.5">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-amber-50 dark:bg-amber-900/10 animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
