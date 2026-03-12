import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import Table from '../../components/Table';
import { apiRequest } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/format';
import { useRequireAuth } from '../../lib/requireAuth';

export default function MemberProfile() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const memberId = router.query.memberId;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [edit, setEdit] = useState({ name: '', phone: '', address: '', family_name: '' });

  useEffect(() => {
    if (!memberId) return;
    setError('');
    apiRequest(`/api/members/${memberId}`)
      .then((res) => {
        setData(res);
        setEdit({
          name: res.member.name || '',
          phone: res.member.phone || '',
          address: res.member.address || '',
          family_name: res.member.family_name || '',
        });
      })
      .catch((e) => setError(e.message));
  }, [memberId]);

  const donationColumns = useMemo(
    () => [
      { key: 'donation_id', label: 'Donation ID', render: (r) => <Link className="underline" href={`/donations/${r.donation_id}`}>{r.donation_id}</Link> },
      { key: 'donated_at', label: 'Date', render: (r) => formatDateTime(r.donated_at) },
      { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
      { key: 'payment_mode', label: 'Mode' },
      { key: 'donation_type', label: 'Type' },
    ],
    []
  );

  return (
    <Layout title={`Member Profile${data?.member?.member_id ? ` – ${data.member.member_id}` : ''}`}>
      <div className="space-y-4">
        <Alert message={error} />

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Profile">
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">Member ID:</span> <span className="font-medium">{data?.member?.member_id || '-'}</span></div>
              <div><span className="text-gray-600">Name:</span> <span className="font-medium">{data?.member?.name || '-'}</span></div>
              <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{data?.member?.phone || '-'}</span></div>
              <div><span className="text-gray-600">Family:</span> <span className="font-medium">{data?.member?.family_name || '-'}</span></div>
              <div><span className="text-gray-600">Address:</span> <span className="font-medium">{data?.member?.address || '-'}</span></div>
              <div><span className="text-gray-600">Status:</span> <span className="font-medium">{data?.member?.archived ? 'Archived' : 'Active'}</span></div>
              <div><span className="text-gray-600">Created at:</span> <span className="font-medium">{formatDateTime(data?.member?.created_at) || '-'}</span></div>
              <div>
                <span className="text-gray-600">Created by:</span>{' '}
                <span className="font-medium">
                  {data?.member?.created_by?.name ? `${data.member.created_by.name} (${data.member.created_by.phone})` : '-'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {user?.role === 'viewer' ? null : (
                <Link href={`/donations/new?member_id=${encodeURIComponent(String(memberId))}`} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm">
                  Add donation
                </Link>
              )}
              {user?.role === 'viewer' || data?.member?.archived ? null : (
                <button
                  className="px-3 py-1.5 rounded-md border text-sm text-red-700"
                  onClick={async () => {
                    if (!confirm('Archive this member?')) return;
                    try {
                      await apiRequest(`/api/members/${memberId}/archive`, { method: 'POST' });
                      window.location.reload();
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Archive
                </button>
              )}

              {user?.role === 'viewer' ? null : (
                <button
                  className="px-3 py-1.5 rounded-md border text-sm text-red-700"
                  onClick={async () => {
                    if (!confirm('Delete this member permanently? This is allowed only if there are no donations.')) return;
                    setError('');
                    try {
                      await apiRequest(`/api/members/${memberId}`, { method: 'DELETE' });
                      window.location.href = '/members';
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </Card>

          <Card title="Contribution">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Year: {data?.contribution?.year ?? '-'}</div>
              <div className="text-sm">Total donations: <span className="font-semibold">{data?.donation_history?.donations_count ?? 0}</span></div>
              <div className="text-sm">Total paid (all time): <span className="font-semibold">{formatINR(data?.donation_history?.total_donated)}</span></div>
              <div className="text-sm">Paid: <span className="font-semibold">{formatINR(data?.contribution?.paid)}</span></div>
              <div className="text-sm">Pending: <span className="font-semibold">{formatINR(data?.contribution?.pending)}</span></div>
            </div>
          </Card>

          <Card title="Edit member">
            <div className="space-y-2">
              <Input label="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <Input label="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              <Input label="Address" value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} />
              <Input label="Family name" value={edit.family_name} onChange={(e) => setEdit({ ...edit, family_name: e.target.value })} />

              {user?.role === 'viewer' ? (
                <div className="text-sm text-gray-600">Viewer mode: editing disabled</div>
              ) : (
                <button
                  className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm"
                  onClick={async () => {
                    setError('');
                    try {
                      await apiRequest(`/api/members/${memberId}`, { method: 'PUT', body: edit });
                      window.location.reload();
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Save changes
                </button>
              )}
            </div>
          </Card>
        </div>

        <Card title={`Donation history (total ${formatINR(data?.donation_history?.total_donated)})`}>
          <Table
            columns={donationColumns}
            rows={data?.donation_history?.items || []}
            rowKey={(r) => r.donation_id}
          />
        </Card>
      </div>
    </Layout>
  );
}
