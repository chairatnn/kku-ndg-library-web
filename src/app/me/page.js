'use client';

import { useEffect, useState } from 'react';
import Toast from '../components/Toast';

export default function MePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function run() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setToastMessage('ยังไม่ได้ login');
        setToastOpen(true);
        setLoading(false);
        return;
      }

      const resp = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();

      if (!resp.ok) {
        setToastMessage(json?.message || 'เรียก /me ไม่สำเร็จ');
        setToastOpen(true);
        setLoading(false);
        return;
      }

      setData(json);
      setLoading(false);
    }

    run();
  }, []);

  return (
    <main className="mx-auto max-w-md space-y-4">
      <Toast open={toastOpen} variant="error" message={toastMessage} onClose={() => setToastOpen(false)} />

      <h1 className="text-xl font-semibold">Me</h1>

      {loading ? <div className="text-sm text-gray-600">Loading...</div> : null}

      {data ? (
        <pre className="overflow-auto rounded-md border bg-gray-50 p-3 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}