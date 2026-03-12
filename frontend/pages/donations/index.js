import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { apiRequest } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/format';
import { useRequireAuth } from '../../lib/requireAuth';

export default function DonationsLedger() {
  const { ready, user } = useRequireAuth();

  const [q, setQ] = useState('');
  const [memberId, setMemberId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [resp, setResp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    setError('');

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '10');
    if (q) params.set('q', q);
    if (memberId) params.set('member_id', memberId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    apiRequest(`/api/donations?${params.toString()}`)
      .then(setResp)
      .catch((e) => setError(e.message));
  }, [ready, page, q, memberId, from, to]);

  const columns = [
    {
      key: 'donation_id',
      label: 'Donation ID',
      render: (r) => <Link className="underline" href={`/donations/${r.donation_id}`}>{r.donation_id}</Link>,
    },
    { key: 'donor_name', label: 'Donor' },
    { key: 'member_id', label: 'Member', render: (r) => r.member_id || '-' },
    { key: 'donated_at', label: 'Date', render: (r) => formatDateTime(r.donated_at) },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'payment_mode', label: 'Mode' },
  ];

  return (
    <Layout title="Donations Ledger">
      <div className="space-y-4">
        <Alert message={error} />

        <Card
          title="Filters"
          footer={
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Filter by date/member or search by name, donation id, member id.</div>
              {user?.role === 'viewer' ? null : (
                <Link href="/donations/new" className="text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white">Add donation</Link>
              )}
            </div>
          }
        >
          <div className="grid md:grid-cols-4 gap-3">
            <Input label="Search" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Rajesh / D0001 / M001" />
            <Input label="Member ID" value={memberId} onChange={(e) => { setPage(1); setMemberId(e.target.value); }} placeholder="M001" />
            <Input label="From (YYYY-MM-DD)" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value); }} placeholder="2026-01-01" />
            <Input label="To (YYYY-MM-DD)" value={to} onChange={(e) => { setPage(1); setTo(e.target.value); }} placeholder="2026-12-31" />
          </div>
        </Card>

        <Table columns={columns} rows={resp?.items || []} rowKey={(r) => r.donation_id} />
        <Pagination page={resp?.page || 1} pages={resp?.pages || 1} onPage={(p) => setPage(p)} />
      </div>
    </Layout>
  );
}
