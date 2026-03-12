import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Alert from '../../components/Alert';
import { apiRequest } from '../../lib/api';
import { useRequireAuth } from '../../lib/requireAuth';
import { formatINR } from '../../lib/format';

export default function AddDonation() {
  const { user } = useRequireAuth();
  const router = useRouter();

  const [member_id, setMemberId] = useState('');
  const [donor_name, setDonorName] = useState('');
  const [payNow, setPayNow] = useState('');
  const [payLater, setPayLater] = useState('');
  const [donation_type, setDonationType] = useState('');
  const [payment_mode, setPaymentMode] = useState('cash');
  const [transaction_reference, setTxnRef] = useState('');
  const [donated_at, setDonatedAt] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const [memberInfoError, setMemberInfoError] = useState('');

  useEffect(() => {
    if (router.query.member_id) setMemberId(String(router.query.member_id));
  }, [router.query.member_id]);

  useEffect(() => {
    const id = (member_id || '').trim();
    if (!id) { setMemberInfo(null); setMemberInfoError(''); return; }
    setMemberInfoError('');
    apiRequest(`/api/members/${encodeURIComponent(id)}`)
      .then((res) => setMemberInfo(res))
      .catch((e) => { setMemberInfo(null); setMemberInfoError(e.message); });
  }, [member_id]);

  const isNonMember = !member_id.trim();
  const payNowNum = Number(payNow) || 0;
  const payLaterNum = Number(payLater) || 0;
  const totalPromised = payNowNum + payLaterNum;

  async function handleSubmit() {
    setError('');
    if (user?.role === 'viewer') { setError('Editor role required'); return; }
    setLoading(true);
    try {
      const res = await apiRequest('/api/donations', {
        method: 'POST',
        body: {
          member_id: member_id.trim() || null,
          donor_name,
          amount: payNow,
          pay_later_amount: payLater || 0,
          donation_type,
          payment_mode,
          transaction_reference,
          donated_at: donated_at ? new Date(donated_at).toISOString() : undefined,
        },
      });
      window.location.href = `/donations/${res.donation.donation_id}`;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Add Donation">
      <div className="max-w-xl animate-slideUp">
        <Card title="New Donation" accent="amber">
          <div className="space-y-4">
            <Alert message={error} />

            {/* Member ID */}
            <Input
              label="Member ID (optional — leave blank for walk-ins)"
              value={member_id}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="e.g. M001"
            />

            {/* Member info preview */}
            {memberInfo && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {memberInfo.member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    <Link href={`/members/${memberInfo.member.member_id}`} className="hover:underline">
                      {memberInfo.member.name}
                    </Link>
                    <span className="text-xs ml-1 font-normal text-amber-600/70 dark:text-amber-400/60">({memberInfo.member.member_id})</span>
                  </div>
                  <div className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-0.5">
                    Paid this year: <span className="font-semibold">{formatINR(memberInfo.contribution.paid)}</span>
                    {' · '}Pending: <span className="font-semibold text-rose-600 dark:text-rose-400">{formatINR(memberInfo.contribution.pending)}</span>
                  </div>
                </div>
              </div>
            )}
            {memberInfoError && (
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {memberInfoError}
              </div>
            )}

            {/* Donor name */}
            <Input
              label={member_id.trim() ? 'Donor name (auto-filled from member)' : 'Donor name (required for walk-ins)'}
              value={donor_name}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Rajesh Patel"
              disabled={!!memberInfo}
            />

            {/* Payment split section */}
            <div className="rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800/40 p-4 space-y-3 bg-amber-50/40 dark:bg-amber-900/10">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Payment Split
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Pay now (₹)" value={payNow} onChange={(e) => setPayNow(e.target.value)} placeholder="e.g. 30000" />
                <Input label="Pay later / future (₹)" value={payLater} onChange={(e) => setPayLater(e.target.value)} placeholder="e.g. 20000" />
              </div>

              {/* Summary row */}
              {(payNowNum > 0 || payLaterNum > 0) && (
                <div className="flex items-center justify-between text-xs mt-1 pt-2 border-t border-amber-200/60 dark:border-amber-800/30">
                  <div className="flex gap-4">
                    <span className="text-gray-500 dark:text-gray-400">Paying now: <span className="font-bold text-green-600 dark:text-green-400">{formatINR(payNowNum)}</span></span>
                    {payLaterNum > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">Deferred: <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(payLaterNum)}</span></span>
                    )}
                  </div>
                  {payLaterNum > 0 && (
                    <span className="font-bold text-amber-700 dark:text-amber-300">Total promise: {formatINR(totalPromised)}</span>
                  )}
                </div>
              )}

              {/* Non-member pay-later callout */}
              {isNonMember && payLaterNum > 0 && (
                <div className="flex items-start gap-2 mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-800/30">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" className="text-rose-500 shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-rose-700 dark:text-rose-400">
                    <strong>{formatINR(payLaterNum)}</strong> deferred amount will appear in <strong>Pending → Non-Members</strong> tab and can be recorded when received.
                  </span>
                </div>
              )}
            </div>

            <Input label="Donation type" value={donation_type} onChange={(e) => setDonationType(e.target.value)} placeholder="Annual / Festival / Special" />

            <Select label="Payment mode" value={payment_mode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
            </Select>

            <Input label="Transaction reference" value={transaction_reference} onChange={(e) => setTxnRef(e.target.value)} placeholder="UPI Ref / Bank Txn ID" />
            <Input label="Donated at" type="datetime-local" value={donated_at} onChange={(e) => setDonatedAt(e.target.value)} />

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="w-full btn-primary py-3 mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Create Donation{payLaterNum > 0 ? ` + Defer ${formatINR(payLaterNum)}` : ''}
                </span>
              )}
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
