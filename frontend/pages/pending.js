import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Alert from '../components/Alert';
import { apiRequest } from '../lib/api';
import { formatINR, formatDateTime } from '../lib/format';
import { useRequireAuth } from '../lib/requireAuth';

/* ── Tab nav ───────────────────────────────────────────────── */
function Tabs({ active, onChange }) {
  const tabs = [
    {
      id: 'members',
      label: 'Members',
      icon: (
        <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      id: 'non-members',
      label: 'Non-Members / Walk-ins',
      icon: (
        <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-1 bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100/70 dark:border-amber-900/25 rounded-xl p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex-1 justify-center
            ${active === t.id
              ? 'bg-white dark:bg-[#1a1232] text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200/60 dark:border-amber-700/30'
              : 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'}`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MEMBERS PENDING TAB
════════════════════════════════════════════════════════════ */
function MembersPendingTab({ user }) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [resp, setResp] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payModeByMemberId, setPayModeByMemberId] = useState({});
  const [loadingByMemberId, setLoadingByMemberId] = useState({});
  const [partialAmtByMemberId, setPartialAmtByMemberId] = useState({});
  const [paidRowIds, setPaidRowIds] = useState(new Set()); // track newly-ticked members

  async function reload() {
    setError('');
    const r = await apiRequest(`/api/pending?year=${encodeURIComponent(year)}`);
    setResp(r);
    setPaidRowIds(new Set());
  }

  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, [year]);

  async function recordPayment(row) {
    if (user?.role === 'viewer') { setError('Editor role required'); return; }
    if (!row?.member_id || !row?.pending || row.pending <= 0) return;

    const memberId = row.member_id;
    const customAmt = partialAmtByMemberId[memberId];
    const amount = customAmt ? Number(customAmt) : row.pending;

    if (!amount || amount <= 0) { setError('Enter a valid payment amount'); return; }
    if (amount > row.pending) { setError(`Amount cannot exceed outstanding ${formatINR(row.pending)}`); return; }

    const paymentMode = payModeByMemberId[memberId] || 'cash';
    const isFullPayment = amount >= row.pending;
    const confirmMsg = isFullPayment
      ? `Mark full pending payment of ${formatINR(amount)} for ${memberId} (${row.name}) as paid?`
      : `Record partial payment of ${formatINR(amount)} for ${memberId} (${row.name})? Remaining: ${formatINR(row.pending - amount)}`;

    if (!confirm(confirmMsg)) return;

    setLoadingByMemberId((m) => ({ ...m, [memberId]: true }));
    setError('');
    setSuccess('');
    try {
      await apiRequest('/api/pending/member/mark-paid', {
        method: 'POST',
        body: {
          member_id: memberId,
          amount,
          payment_mode: paymentMode,
          year: Number(year),
        },
      });
      // Show tick animation for full payment
      if (isFullPayment) {
        setPaidRowIds((s) => new Set([...s, memberId]));
        setSuccess(`✓ Payment of ${formatINR(amount)} recorded for ${row.name}`);
        setTimeout(() => {
          reload().catch(() => {});
        }, 1200);
      } else {
        setSuccess(`✓ Partial payment of ${formatINR(amount)} recorded for ${row.name}`);
        await reload();
      }
      setPartialAmtByMemberId((m) => ({ ...m, [memberId]: '' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingByMemberId((m) => ({ ...m, [memberId]: false }));
    }
  }

  const columns = [
    {
      key: 'member_id', label: 'Member ID',
      render: (r) => (
        <Link className="text-amber-600 dark:text-amber-400 hover:underline font-medium" href={`/members/${r.member_id}`}>
          {r.member_id}
        </Link>
      ),
    },
    {
      key: 'name', label: 'Name',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{r.name}</div>
            {r.family_name && <div className="text-xs text-gray-400">{r.family_name}</div>}
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (r) => <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{r.phone}</span> },
    {
      key: 'paid', label: 'Paid So Far',
      render: (r) => <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{formatINR(r.paid)}</span>,
    },
    {
      key: 'pending', label: 'Pending Amount',
      render: (r) => {
        const isPaid = paidRowIds.has(r.member_id);
        if (isPaid) {
          return (
            <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
              <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Paid ✓
            </span>
          );
        }
        return (
          <div>
            <span className="badge bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-sm font-bold">
              {formatINR(r.pending)}
            </span>
            {r.original_pay_later > 0 && r.original_pay_later !== r.pending && (
              <div className="text-[10px] text-gray-400 mt-0.5">of {formatINR(r.original_pay_later)} promised</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'action', label: 'Record Payment',
      render: (r) => {
        const memberId = r.member_id;
        const loading = !!loadingByMemberId[memberId];
        const isPaid = paidRowIds.has(memberId);
        const disabled = loading || isPaid || user?.role === 'viewer';
        const customAmt = partialAmtByMemberId[memberId];
        const inputAmt = customAmt ? Number(customAmt) : 0;
        const isFullPayment = !customAmt || inputAmt >= r.pending;

        return (
          <div className="flex items-end gap-2 flex-wrap">
            {/* Partial amount input */}
            <div className="w-28">
              <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                max={r.pending}
                placeholder={String(r.pending)}
                value={partialAmtByMemberId[memberId] || ''}
                onChange={(e) => setPartialAmtByMemberId((m) => ({ ...m, [memberId]: e.target.value }))}
                disabled={disabled}
                className="w-full rounded-xl border-2 px-2 py-1.5 text-sm
                           border-amber-100 dark:border-amber-900/30
                           bg-white dark:bg-[#1a1232]/80
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:border-amber-400
                           focus:ring-2 focus:ring-amber-400/15
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {/* Mode */}
            <div className="w-24">
              <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">Mode</label>
              <select
                value={payModeByMemberId[memberId] || 'cash'}
                onChange={(e) => setPayModeByMemberId((m) => ({ ...m, [memberId]: e.target.value }))}
                disabled={disabled}
                className="w-full rounded-xl border-2 px-2 py-1.5 text-sm
                           border-amber-100 dark:border-amber-900/30
                           bg-white dark:bg-[#1a1232]/80
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:border-amber-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <button
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                ${isPaid
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                  : disabled
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    : isFullPayment
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm'
                      : 'btn-primary text-xs'}`}
              disabled={disabled}
              onClick={() => recordPayment(r)}
            >
              {isPaid ? (
                <>
                  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Done
                </>
              ) : loading ? (
                <svg className="animate-spin" viewBox="0 0 24 24" width="12" height="12" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {isPaid ? '' : loading ? 'Saving…' : isFullPayment ? 'Mark Paid ✓' : 'Record'}
            </button>
          </div>
        );
      },
    },
  ];

  const items = resp?.items || [];

  return (
    <div className="space-y-5">
      {error && <Alert message={error} />}
      {success && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="text-green-600 dark:text-green-400 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">{success}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Year picker */}
        <Card accent="amber">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Year</div>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-28 mt-1 rounded-lg border-2 px-2 py-1 text-sm font-bold
                           border-amber-200 dark:border-amber-800/40
                           bg-amber-50 dark:bg-amber-900/10
                           text-amber-700 dark:text-amber-400
                           focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </Card>

        {/* Total pending */}
        <Card accent="rose">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Pending (Members)</div>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{formatINR(resp?.total_pending)}</div>
              {items.length > 0 && (
                <div className="text-xs text-gray-400 mt-0.5">{items.length} member{items.length !== 1 ? 's' : ''} with dues</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Pending summary cards */}
      {items.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((row) => (
            <div
              key={row.member_id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                ${paidRowIds.has(row.member_id)
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                  : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/20'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                ${paidRowIds.has(row.member_id) ? 'bg-green-500' : 'bg-gradient-to-br from-rose-400 to-red-500'}`}>
                {paidRowIds.has(row.member_id)
                  ? <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  : row.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{row.name}</div>
                <div className="text-xs text-gray-400">{row.member_id}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${paidRowIds.has(row.member_id) ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {paidRowIds.has(row.member_id) ? '✓ Paid' : formatINR(row.pending)}
                </div>
                <div className="text-[10px] text-gray-400">pending</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card title={`Member pending list — ${year}`} accent="amber">
        <Table columns={columns} rows={items} rowKey={(r) => r.member_id} />
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   NON-MEMBERS PENDING TAB
════════════════════════════════════════════════════════════ */
function NonMembersPendingTab({ user }) {
  const [resp, setResp] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingByDonor, setLoadingByDonor] = useState({});
  const [payModeByDonor, setPayModeByDonor] = useState({});
  const [partialAmtByDonor, setPartialAmtByDonor] = useState({});
  const [paidRowIds, setPaidRowIds] = useState(new Set());

  async function reload() {
    setError('');
    const r = await apiRequest('/api/pending/non-members');
    setResp(r);
    setPaidRowIds(new Set());
  }

  useEffect(() => {
    reload().catch((e) => setError(e.message));
  }, []);

  async function markPaid(row) {
    if (user?.role === 'viewer') { setError('Editor role required'); return; }

    const donorName = row.donor_name;
    const customAmt = partialAmtByDonor[donorName];
    const amount = customAmt ? Number(customAmt) : row.outstanding;

    if (!amount || amount <= 0) { setError('Enter a valid payment amount'); return; }
    if (amount > row.outstanding) { setError(`Amount cannot exceed outstanding ${formatINR(row.outstanding)}`); return; }

    const paymentMode = payModeByDonor[donorName] || 'cash';
    const isFullPayment = amount >= row.outstanding;
    const confirmMsg = isFullPayment
      ? `Record full outstanding payment of ${formatINR(amount)} from "${donorName}"?`
      : `Record partial payment of ${formatINR(amount)} from "${donorName}"? Remaining: ${formatINR(row.outstanding - amount)}`;

    if (!confirm(confirmMsg)) return;

    setLoadingByDonor((m) => ({ ...m, [donorName]: true }));
    setError('');
    setSuccess('');
    try {
      await apiRequest('/api/pending/non-member/mark-paid', {
        method: 'POST',
        body: {
          donor_name: donorName,
          amount,
          payment_mode: paymentMode,
          donation_type: 'Pending Paid',
        },
      });
      setPartialAmtByDonor((m) => ({ ...m, [donorName]: '' }));
      if (isFullPayment) {
        setPaidRowIds((s) => new Set([...s, donorName]));
        setSuccess(`✓ Payment of ${formatINR(amount)} recorded for "${donorName}"`);
        setTimeout(() => { reload().catch(() => {}); }, 1200);
      } else {
        setSuccess(`✓ Partial payment of ${formatINR(amount)} recorded for "${donorName}"`);
        await reload();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingByDonor((m) => ({ ...m, [donorName]: false }));
    }
  }

  const columns = [
    {
      key: 'donor_name', label: 'Donor Name',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.donor_name?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium">{r.donor_name}</span>
        </div>
      ),
    },
    {
      key: 'latest_donated_at', label: 'Last Donation',
      render: (r) => <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(r.latest_donated_at)}</span>,
    },
    {
      key: 'latest_donation_id', label: 'Donation ID',
      render: (r) => (
        <Link className="text-amber-600 dark:text-amber-400 hover:underline font-mono text-xs" href={`/donations/${r.latest_donation_id}`}>
          {r.latest_donation_id}
        </Link>
      ),
    },
    {
      key: 'promised_total', label: 'Promised Total',
      render: (r) => <span className="font-semibold">{formatINR(r.promised_total)}</span>,
    },
    {
      key: 'total_paid', label: 'Total Paid',
      render: (r) => <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">{formatINR(r.total_paid)}</span>,
    },
    {
      key: 'outstanding', label: 'Outstanding',
      render: (r) => <span className="badge bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">{formatINR(r.outstanding)}</span>,
    },
    {
      key: 'action', label: 'Record Payment',
      render: (r) => {
        const donorName = r.donor_name;
        const loading = !!loadingByDonor[donorName];
        const isPaid = paidRowIds.has(donorName);
        const disabled = loading || isPaid || user?.role === 'viewer';
        const customAmt = partialAmtByDonor[donorName];
        const inputAmt = customAmt ? Number(customAmt) : 0;
        const isFullPayment = !customAmt || inputAmt >= r.outstanding;
        return (
          <div className="flex items-end gap-2 flex-wrap">
            {/* Partial amount input */}
            <div className="w-28">
              <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                max={r.outstanding}
                placeholder={String(r.outstanding)}
                value={partialAmtByDonor[donorName] || ''}
                onChange={(e) => setPartialAmtByDonor((m) => ({ ...m, [donorName]: e.target.value }))}
                disabled={disabled}
                className="w-full rounded-xl border-2 px-2 py-1.5 text-sm
                           border-amber-100 dark:border-amber-900/30
                           bg-white dark:bg-[#1a1232]/80
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:border-amber-400
                           focus:ring-2 focus:ring-amber-400/15
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {/* Mode */}
            <div className="w-24">
              <label className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">Mode</label>
              <select
                value={payModeByDonor[donorName] || 'cash'}
                onChange={(e) => setPayModeByDonor((m) => ({ ...m, [donorName]: e.target.value }))}
                disabled={disabled}
                className="w-full rounded-xl border-2 px-2 py-1.5 text-sm
                           border-amber-100 dark:border-amber-900/30
                           bg-white dark:bg-[#1a1232]/80
                           text-gray-800 dark:text-gray-100
                           focus:outline-none focus:border-amber-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <button
              disabled={disabled}
              onClick={() => markPaid(r)}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                ${isPaid
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                  : disabled
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    : isFullPayment
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm'
                      : 'btn-primary text-xs'}`}
            >
              {isPaid ? (
                <><svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Done</>
              ) : loading ? (
                <svg className="animate-spin" viewBox="0 0 24 24" width="12" height="12" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              )}
              {isPaid ? '' : loading ? 'Saving…' : isFullPayment ? 'Mark Paid ✓' : 'Record'}
            </button>
          </div>
        );
      },
    },
  ];

  const items = resp?.items || [];

  return (
    <div className="space-y-5">
      <Alert message={error} />
      {success && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="text-green-600 dark:text-green-400 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">{success}</span>
        </div>
      )}

      {/* Info callout */}
      <div className="flex items-start gap-3 p-4 rounded-2xl
                      bg-amber-50 dark:bg-amber-900/20
                      border border-amber-200/70 dark:border-amber-700/30">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="white">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">How non-member pending works</div>
          <div className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5 leading-relaxed">
            When a walk-in donor promises to pay e.g. <strong>₹50,000</strong> but pays only <strong>₹30,000</strong> now,
            enter the donation with <strong>Pay Now = ₹30,000</strong> and <strong>Pay Later = ₹20,000</strong>.
            The remaining ₹20,000 will appear here. You can record full or partial payments against it.
          </div>
        </div>
      </div>

      <Card accent="rose">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Outstanding (Non-Members)</div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{formatINR(resp?.total_pending)}</div>
            {items.length > 0 && (
              <div className="text-xs text-gray-400 mt-0.5">{items.length} donor{items.length !== 1 ? 's' : ''} with dues</div>
            )}
          </div>
        </div>
      </Card>

      {/* Donor summary cards */}
      {items.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((row) => (
            <div
              key={row.donor_name}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                ${paidRowIds.has(row.donor_name)
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                  : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/20'}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                ${paidRowIds.has(row.donor_name) ? 'bg-green-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                {paidRowIds.has(row.donor_name)
                  ? <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  : row.donor_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{row.donor_name}</div>
                <div className="text-xs text-gray-400">{formatDateTime(row.latest_donated_at)}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${paidRowIds.has(row.donor_name) ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {paidRowIds.has(row.donor_name) ? '✓ Paid' : formatINR(row.outstanding)}
                </div>
                <div className="text-[10px] text-gray-400">outstanding</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card title="Non-member outstanding payments" accent="amber">
        <Table columns={columns} rows={items} rowKey={(r) => r.donor_name} />
      </Card>

      {/* Quick-add button */}
      <div className="flex justify-end">
        <Link href="/donations/new" className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add new walk-in donation with pay later
        </Link>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function PendingPage() {
  const { ready, user } = useRequireAuth();
  const [tab, setTab] = useState('members');

  if (!ready) return null;

  return (
    <Layout title="Pending Contributions">
      <div className="space-y-5">
        <Tabs active={tab} onChange={setTab} />

        {tab === 'members'
          ? <MembersPendingTab user={user} />
          : <NonMembersPendingTab user={user} />
        }
      </div>
    </Layout>
  );
}
