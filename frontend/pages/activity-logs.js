import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';
import { apiRequest } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { useRequireAuth } from '../lib/requireAuth';

const ACTION_BADGE = {
  CREATE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  UPDATE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  WIPE:   'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  LOGIN:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

export default function ActivityLogsPage() {
  const { ready } = useRequireAuth();
  const [page, setPage] = useState(1);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    setError('');
    apiRequest(`/api/activity-logs?page=${page}&limit=15`)
      .then(setResp)
      .catch((e) => setError(e.message));
  }, [ready, page]);

  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (r) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateTime(r.timestamp)}</span>
      ),
    },
    {
      key: 'actor_name',
      label: 'Actor',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                          flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {r.actor_name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="font-medium text-xs">{r.actor_name}</span>
        </div>
      ),
    },
    { key: 'entity', label: 'Entity' },
    {
      key: 'action',
      label: 'Action',
      render: (r) => {
        const cls = ACTION_BADGE[r.action?.toUpperCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
        return <span className={`badge text-[11px] ${cls}`}>{r.action}</span>;
      },
    },
    { key: 'entity_id', label: 'Entity ID', render: (r) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{r.entity_id}</span>
    ) },
    {
      key: 'details',
      label: 'Details',
      render: (r) => (
        <span className="whitespace-normal text-xs text-gray-600 dark:text-gray-300 max-w-xs block">{r.details}</span>
      ),
    },
  ];

  return (
    <Layout title="Activity Logs">
      <div className="space-y-4">
        <Alert message={error} />
        <Card title="All actions" accent="amber">
          <Table columns={columns} rows={resp?.items || []} rowKey={(r) => `${r.entity_id}-${r.timestamp}`} />
          <Pagination page={resp?.page || 1} pages={resp?.pages || 1} onPage={(p) => setPage(p)} />
        </Card>
      </div>
    </Layout>
  );
}
