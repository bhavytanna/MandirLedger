import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Alert from '../../components/Alert';
import { useRequireAuth } from '../../lib/requireAuth';
import { getToken } from '../../lib/auth';

export default function ReceiptPage() {
  useRequireAuth();
  const router = useRouter();
  const receiptId = router.query.receiptId;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const token = getToken();
  const url = receiptId ? `${apiBase}/api/receipts/${receiptId}/pdf?token=${encodeURIComponent(token)}` : '';

  return (
    <Layout title={`Receipt ${receiptId || ''}`.trim()}>
      <div className="space-y-4">
        {!receiptId ? <Alert message="Receipt ID missing" /> : null}

        <Card
          title="Receipt PDF"
          footer={
            <div className="flex items-center justify-end gap-2">
              <a
                className="px-3 py-1.5 rounded-md border text-sm"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
              <button
                className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm"
                onClick={() => window.open(url, '_blank')}
              >
                Print
              </button>
            </div>
          }
        >
          {receiptId ? (
            <iframe title="Receipt" src={url} className="w-full h-[75vh] border rounded-md" />
          ) : (
            <div className="text-sm text-gray-600">Provide a receipt id.</div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
