"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function EditBookPage() {
  const { id } = useParams();
  const router = useRouter();
  const API_BASE = "http://localhost:3000/api"; // ยิงตรงหา Express

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- 1. โหลดข้อมูลเดิมมาเติมลงฟอร์ม (Step 7) ---
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const resp = await fetch(`${API_BASE}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const json = await resp.json();
        
        if (resp.ok && json.data) {
          const { title, author, category, isbn } = json.data;
          setForm({
            title: title || "",
            author: author || "",
            category: category || "",
            isbn: isbn || ""
          });
        } else {
          setError("ไม่พบข้อมูลหนังสือที่ต้องการแก้ไข");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // --- 2. ส่งข้อมูลที่แก้ไขแล้วกลับไปบันทึก (Step 9) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (resp.ok) {
        alert("บันทึกการแก้ไขเรียบร้อยแล้ว!");
        router.push("/books"); // กลับหน้าหลัก
        router.refresh(); // บังคับให้โหลดข้อมูลใหม่
      } else {
        const json = await resp.json();
        alert(json.message || "แก้ไขไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">กำลังดึงข้อมูลเดิม...</div>;

  return (
    <ProtectedRoute>
      <main className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft className="h-4 w-4" /> ยกเลิกและกลับ
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">แก้ไขข้อมูลหนังสือ</h1>
            
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อหนังสือ *</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-3 text-slate-700 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ผู้แต่ง (ถ้ามี)</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="w-full p-3 text-slate-700 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-3 text-slate-700 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Science">Science</option>
                    <option value="Art">Art</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ISBN *</label>
                  <input
                    name="isbn"
                    required
                    value={form.isbn}
                    onChange={handleChange}
                    className="w-full p-3 text-slate-700 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                บันทึกการเปลี่ยนแปลง
              </button>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}