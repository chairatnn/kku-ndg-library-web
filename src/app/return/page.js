"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  Hash,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ReturnPage() {
  const [borrows, setBorrows] = useState([]);
  const [borrowIdInput, setBorrowIdInput] = useState(""); // สำหรับช่องกรอก BR...
  const [searchTerm, setSearchTerm] = useState(""); // สำหรับช่องค้นหาทั่วไป
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // เก็บ ID ที่กำลังกดคืน

  const API_BASE = "http://localhost:3000/api";

  // 1. โหลดข้อมูลรายการยืมทั้งหมด
  const loadBorrows = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/borrows?scope=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (resp.ok) {
        // กรองเอาเฉพาะรายการที่ยังไม่คืน (หรือจะโชว์ทั้งหมดแล้วแยกสถานะก็ได้)
        setBorrows(json.data || []);
      }
    } catch (err) {
      console.error("Load borrows error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrows();
  }, []);

  // 2. ระบบค้นหา (กรองข้อมูลในตาราง)
  const filteredBorrows = useMemo(() => {
    return borrows.filter((item) => {
      const search = searchTerm.toLowerCase();
      const idStr = `BR${item.id.toString().padStart(3, "0")}`.toLowerCase();
      return (
        idStr.includes(search) ||
        item.user_name?.toLowerCase().includes(search) ||
        item.book_title?.toLowerCase().includes(search)
      );
    });
  }, [borrows, searchTerm]);

  // 3. ฟังก์ชันดำเนินการคืนหนังสือ
  const handleReturnAction = async (id) => {
    if (!id) return;

    // แปลงรหัสจาก BR001 เป็น 1 (ถ้าผู้ใช้กรอกแบบมี BR นำหน้า)
    const cleanId = typeof id === "string" ? id.replace(/\D/g, "") : id;

    setSubmitting(cleanId);
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/returns/${cleanId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await resp.json();

      if (resp.ok) {
        alert("คืนหนังสือสำเร็จ!");
        setBorrowIdInput("");
        loadBorrows(); // Reload ข้อมูลใหม่
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการคืน");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            คืนหนังสือ
          </h1>
          <p className="text-slate-500 mt-1">ค้นหาและบันทึกการคืนหนังสือ</p>
        </div>

        {/* ส่วน Container ของ Search & Action */}
        <div className="flex flex-col gap-6 mb-8">
          {/* บรรทัดที่ 1: ช่องกรอกด่วน (Quick Return) */}
          <div className="w-full lg:w-2/3">
            {" "}
            {/* ปรับความกว้างตามความเหมาะสม เช่น 2 ใน 3 ของหน้าจอ */}
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 text-gray-600 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  placeholder="ใส่ Borrow ID เพื่อคืนทันที เช่น BR007"
                  value={borrowIdInput}
                  onChange={(e) => setBorrowIdInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleReturnAction(borrowIdInput)
                  }
                />
              </div>
              <button
                onClick={() => handleReturnAction(borrowIdInput)}
                disabled={!borrowIdInput || submitting}
                className="bg-slate-400 text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-slate-500 disabled:opacity-50 transition-all shadow-sm"
              >
                {submitting === borrowIdInput ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "คืน"
                )}
              </button>
            </div>
          </div>

          {/* บรรทัดที่ 2: ช่องค้นหาในตาราง (Table Search) */}
          <div className="w-full">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 text-gray-600 bg-white border-2 border-slate-200 rounded-2xl outline-none shadow-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                placeholder="ค้นหาจากชื่อผู้ยืม, ชื่อหนังสือ หรือรหัส BR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  รหัส
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ผู้ยืม
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  หนังสือ
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  กำหนดคืน
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-400">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : (
                filteredBorrows.map((item) => {
                  const isOverdue =
                    !item.returned_at && new Date(item.due_date) < new Date();
                  const displayId = `BR${item.id.toString().padStart(3, "0")}`;

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6 text-sm font-medium text-slate-500">
                        {displayId}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-900">
                        {item.user_name}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600">
                        {item.book_title}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500">
                        {new Date(item.due_date).toISOString().split("T")[0]}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            item.returned_at
                              ? "bg-slate-100 text-slate-400"
                              : isOverdue
                                ? "bg-rose-50 text-rose-500"
                                : "bg-orange-50 text-orange-400"
                          }`}
                        >
                          {item.returned_at
                            ? "Returned"
                            : isOverdue
                              ? "Overdue"
                              : "Borrowing"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {!item.returned_at && (
                          <button
                            onClick={() => handleReturnAction(item.id)}
                            disabled={submitting === item.id.toString()}
                            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2 ml-auto"
                          >
                            {submitting === item.id.toString() ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "คืน"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {filteredBorrows.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center gap-2">
              <AlertCircle className="h-10 w-10 text-slate-200" />
              <p className="text-slate-400 font-medium">
                ไม่พบข้อมูลการยืมที่ตรงกับเงื่อนไข
              </p>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
