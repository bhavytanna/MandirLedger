import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Alert from '../../components/Alert';
import { apiRequest } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/format';
import { useRequireAuth } from '../../lib/requireAuth';

export default function DonationDetail() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const donationId = router.query.donationId;

  const [donation, setDonation] = useState(null);
  const [edit, setEdit] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!donationId) return;
    apiRequest(`/api/donations/${donationId}`)
      .then((res) => {
        setDonation(res.donation);
        setEdit({
          member_id: res.donation.member_id || '',
          donor_name: res.donation.donor_name || '',
          amount: String(res.donation.amount ?? ''),
          donation_type: res.donation.donation_type || '',
          payment_mode: res.donation.payment_mode || 'cash',
          transaction_reference: res.donation.transaction_reference || '',
          donated_at: res.donation.donated_at ? new Date(res.donation.donated_at).toISOString().slice(0, 16) : '',
        });
      })
      .catch((e) => setError(e.message));
  }, [donationId]);

  return (
    <Layout title={`Donation ${donation?.donation_id || ''}`.trim()}>
      <div className="space-y-4">
        <Alert message={error} />
        <Alert type="success" message={success} />

        <Card title="Summary">
          <div className="grid md:grid-cols-3 gap-2 text-sm">
            <div><span className="text-gray-600">Donor:</span> <span className="font-medium">{donation?.donor_name || '-'}</span></div>
            <div><span className="text-gray-600">Amount:</span> <span className="font-medium">{formatINR(donation?.amount)}</span></div>
            <div><span className="text-gray-600">Date:</span> <span className="font-medium">{formatDateTime(donation?.donated_at)}</span></div>
            <div><span className="text-gray-600">Member:</span> <span className="font-medium">{donation?.member_id || '-'}</span></div>
            <div><span className="text-gray-600">Mode:</span> <span className="font-medium">{donation?.payment_mode || '-'}</span></div>
            <div><span className="text-gray-600">Type:</span> <span className="font-medium">{donation?.donation_type || '-'}</span></div>
          </div>
        </Card>

        <Card
          title="Edit donation"
          footer={
            <div className="flex items-center justify-end gap-2">
              {user?.role === 'viewer' ? (
                <div className="text-sm text-gray-600">Viewer mode: editing disabled</div>
              ) : (
                <>
                  <button
                    className="px-3 py-1.5 rounded-md border text-sm"
                    onClick={async () => {
                      setError('');
                      setSuccess('');
                      try {
                        const receiptRes = await apiRequest(`/api/receipts/from-donation/${donationId}`, { method: 'POST' });
                        window.location.href = `/receipts/${receiptRes.receipt.receipt_id}`;
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Generate receipt
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm"
                    onClick={async () => {
                      setError('');
                      setSuccess('');
                      try {
                        await apiRequest(`/api/donations/${donationId}`, {
                          method: 'PUT',
                          body: {
                            member_id: edit.member_id ? edit.member_id : null,
                            donor_name: edit.donor_name,
                            amount: edit.amount,
                            donation_type: edit.donation_type,
                            payment_mode: edit.payment_mode,
                            transaction_reference: edit.transaction_reference,
                            donated_at: edit.donated_at ? new Date(edit.donated_at).toISOString() : undefined,
                          },
                        });
                        setSuccess('Donation updated');
                        const fresh = await apiRequest(`/api/donations/${donationId}`);
                        setDonation(fresh.donation);
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          }
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Member ID (optional)" value={edit.member_id || ''} onChange={(e) => setEdit({ ...edit, member_id: e.target.value })} />
            <Input label="Donor name" value={edit.donor_name || ''} onChange={(e) => setEdit({ ...edit, donor_name: e.target.value })} />
            <Input label="Amount" value={edit.amount || ''} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} />
            <Input label="Donation type" value={edit.donation_type || ''} onChange={(e) => setEdit({ ...edit, donation_type: e.target.value })} />
            <Select label="Payment mode" value={edit.payment_mode || 'cash'} onChange={(e) => setEdit({ ...edit, payment_mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
            </Select>
            <Input label="Transaction reference" value={edit.transaction_reference || ''} onChange={(e) => setEdit({ ...edit, transaction_reference: e.target.value })} />
            <Input label="Donated at" type="datetime-local" value={edit.donated_at || ''} onChange={(e) => setEdit({ ...edit, donated_at: e.target.value })} />
          </div>
        </Card>
      </div>
    </Layout>
  );
}
