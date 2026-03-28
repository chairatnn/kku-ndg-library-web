'use client';

import { useEffect, useState } from 'react';
import Toast from './Toast';

export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  redirectDelay = 1200,
  title = 'ยังไม่ได้เข้าสู่ระบบ',
  description = 'กรุณา login ก่อนใช้งานหน้านี้',
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('accessToken');

    if (!token) {
      setToastOpen(true);
      setCheckingAuth(false);

      const timeoutId = window.setTimeout(() => {
        window.location.href = redirectTo;
      }, redirectDelay);

      return () => window.clearTimeout(timeoutId);
    }

    setAuthorized(true);
    setCheckingAuth(false);
    return undefined;
  }, [redirectDelay, redirectTo]);

  if (checkingAuth) {
    return <div className="text-sm text-slate-600">Checking session...</div>;
  }

  if (!authorized) {
    return (
      <>
        <Toast
          open={toastOpen}
          variant="destructive"
          title={title}
          description={description}
          duration={redirectDelay}
          onClose={() => setToastOpen(false)}
        />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">หน้านี้ต้อง login ก่อน</p>
          <p className="mt-1 text-amber-800">ระบบกำลังพากลับไปหน้า login</p>
        </div>
      </>
    );
  }

  return children;
}