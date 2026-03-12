import { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Alert from '../../components/Alert';
import { apiRequest } from '../../lib/api';
import { useRequireAuth } from '../../lib/requireAuth';

export default function AddMember() {
  const { user } = useRequireAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [family_name, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <Layout title="Add Member">
      <div className="max-w-xl">
        <Card title="New member">
          <div className="space-y-3">
            <Alert message={error} />
            <Alert type="success" message={success} />

            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input label="Family name" value={family_name} onChange={(e) => setFamilyName(e.target.value)} />

            <button
              onClick={async () => {
                setError('');
                setSuccess('');
                if (user?.role === 'viewer') {
                  setError('Editor role required');
                  return;
                }
                try {
                  const res = await apiRequest('/api/members', {
                    method: 'POST',
                    body: { name, phone, address, family_name },
                  });
                  setSuccess(`Member created: ${res.member.member_id}`);
                  window.location.href = `/members/${res.member.member_id}`;
                } catch (e) {
                  setError(e.message);
                }
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white text-sm"
            >
              Create member
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
