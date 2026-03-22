"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState(""); // เปลี่ยนชื่อ State ให้สื่อความหมาย
  const debounceRef = useRef(null);

  const loadBooks = async (query = "", showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const url = `/api/books?search=${encodeURIComponent(query)}${userId ? `&userId=${userId}` : ""}`;

      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await resp.json();
      if (resp.ok) {
        setBooks(json.data || []);
      } else {
        if (resp.status === 401) {
          setError("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          setError(json.message || "โหลดข้อมูลไม่สำเร็จ");
        }
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // ... handleBorrow และ handleReturn คงเดิม ...
  const handleBorrow = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนยืมหนังสือ");
      return;
    }
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const pad = (n) => String(n).padStart(2, "0");
      const dueDateStr = `${dueDate.getFullYear()}-${pad(dueDate.getMonth() + 1)}-${pad(dueDate.getDate())}`;
      const resp = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, dueDate: dueDateStr }),
      });
      if (resp.ok) {
        alert("ยืมหนังสือสำเร็จ!");
        loadBooks(searchTerm, false);
      } else {
        const json = await resp.json();
        alert(json.message || "ไม่สามารถยืมได้");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleReturn = async (borrowId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const resp = await fetch(`/api/return/${borrowId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        alert("คืนหนังสือสำเร็จ!");
        loadBooks(searchTerm, false);
      } else {
        const json = await resp.json();
        alert(json.message || "ไม่สามารถคืนได้");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  useEffect(() => {
    // แก้ไขจุดนี้: ดึงค่า email จาก localStorage มาแสดงแทน
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    } else {
      setUserEmail("Guest");
    }

    loadBooks("", true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadBooks(searchTerm, false);
    }, 300);
  }, [searchTerm]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;

  return (
    <main className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          คลังหนังสือ KKU Library
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-slate-500">user name:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {userEmail} {/* แสดง E-mail ที่นี่ */}
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg transition shadow-sm"
          >
            ไปหน้า Login
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="mb-8">
        <input
          type="text"
          className="w-full md:w-1/2 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="ค้นหาชื่อหนังสือหรือผู้แต่ง..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <p className="text-gray-500 italic">ไม่มีหนังสือในระบบ</p>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* --- ปรับปรุงส่วน Header ของ Card --- */}
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-800 leading-tight break-words">
                  {book.title}
                </h3>

                {/* ส่วนแสดง Due Date ชิดขวา */}
                {!book.is_available && book.due_date && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded whitespace-nowrap shrink-0 mt-1">
                    Due:{" "}
                    {new Date(book.due_date)
                      .toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .replace(/\//g, "-")}
                  </span>
                )}
              </div>

              <div>
                <p className="text-slate-500 text-sm mb-4">
                  ผู้แต่ง: {book.author || "ไม่ระบุ"}
                </p>

                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${
                    book.is_available
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${book.is_available ? "bg-emerald-500" : "bg-rose-500"}`}
                  ></span>
                  {book.is_available ? "พร้อมให้บริการ" : "อยู่ระหว่างการยืม"}
                </div>
              </div>

              <div className="mt-2">
                {book.is_available ? (
                  <button
                    onClick={() => handleBorrow(book.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    ยืมหนังสือ
                  </button>
                ) : book.can_return ? (
                  <button
                    onClick={() => handleReturn(book.borrow_id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    คืนหนังสือ
                  </button>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-center text-sm">
                    ไม่ว่าง (ถูกยืมโดยผู้อื่น)
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
