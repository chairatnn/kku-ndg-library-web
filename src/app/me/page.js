"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // นำเข้า Link สำหรับไปหน้า Books
import Toast from "../components/Toast";
import ProtectedRoute from "../components/ProtectedRoute";

export default function MePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function run() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setToastMessage("ยังไม่ได้ login");
        setToastOpen(true);
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await resp.json();

        if (!resp.ok) {
          setToastMessage(json?.message || "เรียก /me ไม่สำเร็จ");
          setToastOpen(true);
          setLoading(false);
          return;
        }

        setData(json.data || json); // รองรับทั้งโครงสร้าง {data: {...}} และ {...}
        setLoading(false);
      } catch (err) {
        setToastMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        setToastOpen(true);
        setLoading(false);
      }
    }

    run();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-md p-6 space-y-6">
        <Toast
          open={toastOpen}
          variant="error"
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">โปรไฟล์ของฉัน</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* ส่วนหัวโปรไฟล์ */}
            <div className="bg-blue-600 h-24 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md">
                  <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 uppercase">
                    {data.name?.charAt(0) || "U"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {data.user?.email?.split("@")[0] ||
                    `User ID: ${data.user?.id}` ||
                    "ไม่ระบุชื่อ"}
                </h2>
                <p className="text-slate-500 text-sm">
                  Email:{" "}
                  <span className="text-slate-700">
                    {data.user?.email || "-"}
                  </span>
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Role:{" "}
                  <span className="capitalize">
                    {data.user?.role || "user"}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {/* --- ปุ่มไปหน้า Books --- */}
                <Link
                  href="/books"
                  className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  ไปรายการหนังสือ
                </Link>

                {/* ปุ่ม Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 font-medium py-3 px-4 rounded-xl transition duration-200"
                >
                  ออกจากระบบ
                </button>
              </div>

              {/* ส่วน Debug ข้อมูล (ซ่อนไว้ในตอนใช้งานจริง หรือเปิดดูถ้าต้องการ) */}
              <details className="mt-4">
                <summary className="text-xs text-slate-400 cursor-pointer hover:underline">
                  ดูข้อมูลทางเทคนิค (Raw JSON)
                </summary>
                <pre className="mt-2 overflow-auto rounded-md border bg-slate-50 p-3 text-[10px] text-slate-500">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">ไม่พบข้อมูลผู้ใช้งาน</p>
            <Link
              href="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              ไปหน้า Login
            </Link>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}



