"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBook, setCurrentBook] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const debounceRef = useRef(null);

  // กำหนด Base URL ไว้ที่เดียวจะได้แแก้รวดเดียวจบ
  const API_BASE = "http://localhost:3000/api";

  const loadBooks = async (query = "", showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const url = `${API_BASE}/books?search=${encodeURIComponent(query)}${userId ? `&userId=${userId}` : ""}`;
      // const url = `/api/books?search=${encodeURIComponent(query)}`;

      const resp = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await resp.json();
      if (resp.ok) {
        setBooks(json.data || []);
      } else {
        setError(
          resp.status === 401
            ? "Session หมดอายุ"
            : json.message || "โหลดข้อมูลไม่สำเร็จ",
        );
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleViewBook = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      // ตรวจสอบว่ามี /api/ และ id ต่อท้ายถูกต้องไหม
      const resp = await fetch(`${API_BASE}/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.status === 404) {
        alert("Error 404: ไม่พบ Route บน Server หรือไม่พบ ID นี้");
        return;
      }

      const json = await resp.json();
      if (resp.ok) {
        setCurrentBook(json.data); // เก็บข้อมูลหนังสือที่ดึงมาได้
        setIsViewModalOpen(true); // เปิด Modal
      } else {
        alert(json.message || "ไม่พบข้อมูลหนังสือ");
      }
    } catch (err) {
      console.error("View error:", err);
    }
  };

  const handleBorrow = async (bookId) => {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    if (!token) return alert("กรุณาเข้าสู่ระบบก่อน");

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const dueDateStr = dueDate.toISOString().split("T")[0];

      // แก้ไข URL เป็น API_BASE
      const resp = await fetch(`${API_BASE}/borrows`, {
        // เช็คชื่อ route borrows เติม s หรือไม่ตามใน app.js
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, userId: userId, dueDate: dueDateStr }),
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
      // แก้ไข URL เป็น API_BASE
      const resp = await fetch(`${API_BASE}/returns/${borrowId}`, {
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

  const handleDelete = async (id, title) => {
    // สร้างการยืนยัน (Confirmation)
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเรื่อง "${title}"?`))
      return;

    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        alert("ลบข้อมูลสำเร็จ");
        loadBooks(searchTerm, false); // โหลดรายการใหม่ทันที
      } else {
        const json = await resp.json();
        alert(json.message || "ลบไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "Guest");
    loadBooks("", true);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadBooks(searchTerm, false), 300);
  }, [searchTerm]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;

  return (
    <ProtectedRoute>
      <main className="p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
          <h1 className="text-2xl font-bold text-slate-800">รายการหนังสือ</h1>
          <Link
            href="/books/add"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> เพิ่มหนังสือ
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mb-8">
          <input
            type="text"
            className="w-full text-gray-800 md:w-1/2 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN หรือหมวดหมู่..."
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
                className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Badge แสดง Category */}
                {book.category && (
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">
                    {book.category}
                  </div>
                )}

                <div className="absolute top-6 right-4 flex gap-0.1 opacity-30 group-hover:opacity-100 transition-opacity">
                  {/* ปุ่มดูรายละเอียด (Step 4) */}
                  <button
                    onClick={() => handleViewBook(book.id)} // เรียกฟังก์ชันที่คุณเขียนไว้ข้างบน
                    className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition"
                    title="ดูรายละเอียด"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* ปุ่มแก้ไข (Step 7) */}
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 rounded-lg transition"
                    title="แก้ไขข้อมูล"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    className="p-1.5 bg-white/80 backdrop-blur-sm hover:bg-rose-50 text-slate-800 hover:text-rose-600 rounded-full shadow-sm border border-slate-100 transition"
                    title="ลบหนังสือ"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 pr-10">
                    {book.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-1">
                    ผู้แต่ง: {book.author || "ไม่ระบุ"}
                  </p>
                  {book.isbn && (
                    <p className="text-slate-400 text-[11px] mb-4 font-mono">
                      ISBN: {book.isbn}
                    </p>
                  )}

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

                  {!book.is_available && book.due_date && (
                    <p className="text-[10px] font-bold text-amber-600 mb-4">
                      กำหนดคืน:{" "}
                      {new Date(book.due_date).toLocaleDateString("th-TH")}
                    </p>
                  )}
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
      {/* Modal สำหรับ View */}
      {isViewModalOpen && currentBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4">{currentBook.title}</h2>
            <div className="space-y-3 text-slate-600 border-t pt-4">
              <p>
                <strong>ผู้แต่ง:</strong> {currentBook.author}
              </p>
              <p>
                <strong>หมวดหมู่:</strong> {currentBook.category}
              </p>
              <p>
                <strong>สถานะ:</strong>{" "}
                {currentBook.is_available ? "พร้อมให้บริการ" : "ถูกยืม"}
              </p>
            </div>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
