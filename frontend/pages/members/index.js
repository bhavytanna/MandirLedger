import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Alert from '../../components/Alert';
import { apiRequest } from '../../lib/api';
import { useRequireAuth } from '../../lib/requireAuth';

export default function MembersList() {
  const { ready, user } = useRequireAuth();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    setError('');
    apiRequest(`/api/members?page=${page}&limit=10&q=${encodeURIComponent(q)}`)
      .then(setResp)
      .catch((e) => setError(e.message));
  }, [ready, page, q]);

  const columns = [
    {
      key: 'member_id',
      label: 'Member ID',
      render: (r) => <Link className="underline" href={`/members/${r.member_id}`}>{r.member_id}</Link>,
    },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'family_name', label: 'Family' },
    {
      key: 'archived',
      label: 'Status',
      render: (r) => (r.archived ? 'Archived' : 'Active'),
    },
  ];

  return (
    <Layout title="Members">
      <div className="space-y-4">
        <Alert message={error} />

        <Card
          title="Search"
          footer={
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">Search by name, phone, member id, family</div>
              {user?.role === 'viewer' ? null : (
                <Link href="/members/new" className="text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white">Add member</Link>
              )}
            </div>
          }
        >
          <Input label="Query" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="e.g. Rajesh / 8888 / M001" />
        </Card>

        <Table
          columns={columns}
          rows={resp?.items || []}
          rowKey={(r) => r.member_id}
        />
        <Pagination
          page={resp?.page || 1}
          pages={resp?.pages || 1}
          onPage={(p) => setPage(p)}
        />
      </div>
    </Layout>
  );
}
