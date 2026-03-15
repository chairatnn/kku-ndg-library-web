'use client';

import { useState } from 'react';
import Toast from '../components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
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

  async function onSubmit(e) {
    e.preventDefault();
    setToastOpen(false);

    if (!email.trim() || !password) {
      showToast('error', 'กรุณากรอก email และ password ให้ครบ');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await resp.json();

      if (!resp.ok) {
        const msg = json?.message || 'Login ไม่สำเร็จ';
        showToast('error', msg);
        return;
      }

      if (!json?.accessToken) {
        showToast('error', 'Server ตอบกลับไม่ถูกต้อง (ไม่มี accessToken)');
        return;
      }

      localStorage.setItem('accessToken', json.accessToken);
      showToast('success', 'Login สำเร็จ');

      // เลือกพาไปหน้าที่ต้องใช้ token
      window.location.href = '/me';
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
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-gray-600">เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ที่ต้องยืนยันตัวตน</p>
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
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        ยังไม่มีบัญชี? <a className="underline" href="/register">สร้างผู้ใช้</a>
      </p>
    </main>
  );
}