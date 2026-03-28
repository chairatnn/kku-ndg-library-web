// src/app/books/add/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Save } from "lucide-react"; // นำเข้า Icon
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import Toast from "../../components/Toast";

export default function AddBookPage() {
  const router = useRouter();

  // --- Step 2 & 3: เตรียม State สำหรับ Form ---
  const initialForm = {
    title: "",
    author: "",
    category: "",
    isbn: "",
    description: "", // เพิ่มคำอธิบายด้วยถ้าต้องการ
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // สำหรับแจ้งเตือน Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("info");

  // ฟังก์ชันอัปเดต State (Change Handler)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // ล้าง Error เมื่อผู้ใช้พิมพ์ใหม่
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ฟังก์ชัน Validation (Client-side)
  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "กรุณากรอกชื่อหนังสือ";
    if (!form.isbn.trim()) newErrors.isbn = "กรุณากรอกรหัส ISBN";
    if (!form.category) newErrors.category = "กรุณาเลือกหมวดหมู่";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ฟังก์ชัน onSubmit (เตรียมส่งไป Step 4)
  //   const onSubmit = async (e) => {
  //     e.preventDefault();

  //     if (!validateForm()) {
  //       setToastVariant('error');
  //       setToastMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
  //       setToastOpen(true);
  //       return;
  //     }

  //     setSubmitting(true);
  //     // TODO: Fetch API (จะอยู่ใน Step 4)
  //     console.log('ข้อมูลที่จะส่ง:', form);

  //     // ตัวอย่างจำลองการทำงาน
  //     setTimeout(() => {
  //         setSubmitting(false);
  //         // router.push('/books');
  //     }, 1000);
  //   };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    const token = localStorage.getItem("accessToken");

    try {
      // ยิงไปที่ Backend Port 3000
      const resp = await fetch("http://localhost:3000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form), // ส่ง title, author, category, isbn ไปครบถ้วน
      });

      const json = await resp.json();

      if (resp.ok) {
        setToastVariant("success");
        setToastMessage("บันทึกหนังสือเรียบร้อยแล้ว");
        setToastOpen(true);

        // หน่วงเวลา 1.2 วินาทีเพื่อให้เห็น Toast แล้วค่อยกลับหน้า List
        setTimeout(() => {
          router.push("/books");
        }, 1200);
      } else {
        throw new Error(json.message || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      setToastVariant("error");
      setToastMessage(err.message || "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl p-6">
        <Toast
          open={toastOpen}
          variant={toastVariant}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />

        {/* ส่วนหัวหน้า */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/books"
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">เพิ่มหนังสือ</h1>
        </div>

        {/* แบบฟอร์ม */}
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-2xl border bg-white p-8 shadow-sm"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              ชื่อหนังสือ *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full rounded-xl border ${errors.title ? "border-rose-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="ระบุชื่อหนังสือ"
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title}</p>
            )}
          </div>

          {/* --- 🌟 เพิ่มช่อง "ผู้แต่ง" ตรงนี้ (ไม่ใส่ required) --- */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              ผู้เขียน / ผู้แต่ง
            </label>
            <input
              name="author"
              type="text"
              value={form.author}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="ระบุชื่อผู้แต่ง (ถ้ามี)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                ISBN *
              </label>
              <input
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                className={`w-full rounded-xl border ${errors.isbn ? "border-rose-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="978-..."
              />
              {errors.isbn && (
                <p className="text-xs text-rose-500">{errors.isbn}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                หมวดหมู่ *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full rounded-xl border ${errors.category ? "border-rose-500" : "border-slate-200"} px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
              >
                <option value="">เลือกหมวดหมู่</option>
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Business">Business</option>
              </select>
              {errors.category && (
                <p className="text-xs text-rose-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-black transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </main>
    </ProtectedRoute>
  );
}
