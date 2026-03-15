'use client';

import { useState } from 'react';
import Toast from '../components/Toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastVariant, setToastVariant] = useState('info');
  const [toastMessage, setToastMessage] = useState('');

  function showToast(variant, message) {
    setToastVariant(variant);
    setToastMessage(message);
    setToastOpen(true);
  }

  function mapCreateUserError(json) {
    if (json?.message === 'Email already exists') return 'อีเมลนี้ถูกใช้งานแล้ว';

    if (json?.message === 'Validation failed' && Array.isArray(json?.errors)) {
      const first = json.errors[0];
      if (first?.field && first?.reason) return `${first.field}: ${first.reason}`;
      return 'ข้อมูลไม่ถูกต้อง';
    }

    return json?.message || 'สร้างผู้ใช้ไม่สำเร็จ';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setToastOpen(false);

    if (!email.trim() || !name.trim() || !password) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const json = await resp.json();

      if (!resp.ok) {
        showToast('error', mapCreateUserError(json));
        return;
      }

      showToast('success', 'สร้างผู้ใช้สำเร็จ');
      window.location.href = '/login';
    } catch {
      showToast('error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6">
      <Toast
        open={toastOpen}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create user</h1>
        <p className="text-sm text-gray-600">สร้างบัญชีสำหรับใช้ login</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alice@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alice"
            autoComplete="name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            type="password"
            autoComplete="new-password"
          />
        </div>

        <button
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        มีบัญชีแล้ว? <a className="underline" href="/login">ไปหน้า login</a>
      </p>
    </main>
  );
}