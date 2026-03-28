"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";

export default function BorrowPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับ Form
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    // กำหนดค่าเริ่มต้นเป็น 7 วันนับจากวันนี้
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().split("T")[0]);

    async function fetchOptions() {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          console.error("No token found, please login again.");
          return;
        }

        const resp = await fetch(`${API_BASE}/borrows/options`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(errorData.message || `Error: ${resp.status}`);
        }

        const json = await resp.json();
        console.log("📥 Data received:", json); // ดูข้อมูลที่ได้ใน Console ของ Browser

        // ตรวจสอบว่า Backend ส่งมาในรูปแบบ { users: [], books: [] } หรือ { data: { users: [], books: [] } }
        setUsers(json.users || []);
        setBooks(json.books || []);
      } catch (err) {
        console.error("❌ Fetch options error:", err.message);
        // หากเกิด Error ให้แจ้งเตือนผู้ใช้เล็กน้อย
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook || !dueDate)
      return alert("กรุณากรอกข้อมูลให้ครบ");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch("http://localhost:3000/api/borrows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(selectedUser),
          bookId: Number(selectedBook),
          dueDate: dueDate,
        }),
      });

      if (resp.ok) {
        alert("บันทึกการยืมสำเร็จ");
        router.push("/"); // กลับไปหน้า Dashboard
      } else {
        const err = await resp.json();
        alert(err.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900">ยืมหนังสือ</h1>
        <p className="text-slate-500 mb-8">
          เลือกผู้ใช้และหนังสือที่ต้องการยืม
        </p>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ผู้ยืม */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                ผู้ยืม *
              </label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- เลือกผู้ใช้งาน --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* หนังสือ */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                หนังสือ *
              </label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all"
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
              >
                <option value="">-- เลือกหนังสือ --</option>
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* วันที่กำหนดคืน */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                วันกำหนดคืน
              </label>
              <input
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">
                ค่าเริ่มต้น: 7 วันนับจากวันนี้
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-4 bg-slate-400 text-white rounded-xl font-bold hover:bg-slate-500 transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? "กำลังบันทึก..." : "ยืนยันการยืม"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
