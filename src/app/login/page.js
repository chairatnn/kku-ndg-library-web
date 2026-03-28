"use client";

import { useState } from "react";
import Toast from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastVariant, setToastVariant] = useState("info");
  const [toastMessage, setToastMessage] = useState("");

  function showToast(variant, message) {
    setToastVariant(variant);
    setToastMessage(message);
    setToastOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setToastOpen(false);

    if (!email.trim() || !password) {
      showToast("error", "กรุณากรอก email และ password ให้ครบ");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await resp.json();

      if (!resp.ok) {
        const msg = json?.message || "Login ไม่สำเร็จ";
        showToast("error", msg);
        return;
      }

      if (!json?.accessToken) {
        showToast("error", "Server ตอบกลับไม่ถูกต้อง (ไม่มี accessToken)");
        return;
      }

      // --- ส่วนที่ปรับปรุงใหม่ ---
      localStorage.setItem("accessToken", json.accessToken);

      // บันทึก Email ลงใน localStorage เพื่อให้หน้า Books นำไปแสดงผล
      // โดยใช้ค่า email จาก input ที่ผู้ใช้พิมพ์เข้ามา (ซึ่งผ่านการตรวจสอบจาก server แล้ว)
      localStorage.setItem("userEmail", email.trim().toLowerCase());

      // เก็บ userId ไว้ด้วยเผื่อใช้ในฟีเจอร์อื่นๆ (ถ้า server ส่งกลับมาใน json.user.id)
      const userId = json.user?.id || json.userId || json.id;

      if (userId) {
        localStorage.setItem("userId", String(userId)); // บันทึกเป็น String เสมอ
        console.log("✅ บันทึก userId สำเร็จ:", userId);
      } else {
        console.error(
          "❌ Server ไม่ได้ส่ง userId กลับมาในรูปแบบที่คาดไว้:",
          json,
        );
      }
      // -----------------------

      showToast("success", "Login สำเร็จ");

      window.location.href = "/me";
    } catch {
      showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <Toast
        open={toastOpen}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-400">Login</h1>
        <p className="text-sm text-gray-400">
          เข้าสู่ระบบ KKU Library Backoffice
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            className="w-full text-slate-700 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@kku.ac.th"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            className="w-full text-slate-700 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500">
        ยังไม่มีบัญชี?{" "}
        <a
          className="text-blue-600 font-semibold hover:underline"
          href="/register"
        >
          สร้างบัญชีผู้ใช้ใหม่
        </a>
      </p>
    </main>
  );
}
