import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { getActor, setActor } from '../lib/actor';

export default function ContributorPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const a = getActor();
    if (a) { setName(a.name); setPhone(a.phone); }
  }, []);

  return (
    <Layout title="Set Contributor">
      <div className="max-w-lg animate-slideUp">
        {/* Info callout */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-5
                        bg-amber-50 dark:bg-amber-900/20
                        border border-amber-200/70 dark:border-amber-700/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                          flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="white">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">Who is adding?</div>
            <div className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5 leading-relaxed">
              This identifies you as the contributor. Your name will appear as{' '}
              <span className="font-mono bg-amber-100 dark:bg-amber-800/40 px-1 rounded">added_by</span> on every record you create.
              It is stored only in your browser.
            </div>
          </div>
        </div>

        <Card title="Identify Yourself" accent="amber">
          <div className="space-y-4">
            <Alert message={error} />

            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />

            <button
              onClick={() => {
                setError('');
                const n = name.trim();
                const p = phone.trim();
                if (!n) return setError('Name is required');
                if (p.length < 6) return setError('Phone must be at least 6 digits');
                setActor({ name: n, phone: p });
                window.location.href = '/dashboard';
              }}
              className="w-full btn-primary py-3 mt-1"
            >
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save &amp; Continue to Dashboard
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
