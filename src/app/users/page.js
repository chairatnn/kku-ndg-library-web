"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      setUsers(json.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // เพิ่ม State ใหม่
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    role: "Student",
    password: "",
  });

  // ฟังก์ชันเปิด Modal สำหรับ "เพิ่ม"
  const openAddModal = () => {
    setModalMode("add");
    setCurrentUser({ name: "", email: "", role: "Student", password: "" });
    setIsModalOpen(true);
  };

  // ฟังก์ชันเปิด Modal สำหรับ "ดู" หรือ "แก้ไข"
  const openEditModal = (user, mode) => {
    setModalMode(mode);
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // ระบบค้นหาจาก ชื่อ หรือ อีเมล
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const handleDelete = async (id, name) => {
    if (!confirm(`ยืนยันการลบผู้ใช้: ${name}?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // โหลดใหม่หลังลบ
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // ถ้าเป็นโหมด add ใช้ POST ถ้าเป็น edit ใช้ PUT
      const method = modalMode === "add" ? "POST" : "PUT";
      const url =
        modalMode === "add"
          ? `${API_BASE}/users`
          : `${API_BASE}/users/${currentUser.id}`;

      const resp = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentUser),
      });

      if (resp.ok) {
        alert(modalMode === "add" ? "เพิ่มผู้ใช้สำเร็จ" : "อัปเดตข้อมูลสำเร็จ");
        setIsModalOpen(false); // ปิด Modal
        fetchUsers(); // โหลดตารางใหม่เพื่อให้เห็นข้อมูลล่าสุด
      } else {
        const err = await resp.json();
        alert(err.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-slate-500">เพิ่ม แก้ไข ลบ ผู้ใช้งานในระบบ</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Plus size={20} /> เพิ่มผู้ใช้
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                  ชื่อ
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                  อีเมล
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                  บทบาท
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                  สถานะ
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase text-right">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-slate-400">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-8 py-6 text-sm font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">
                      {u.email}
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.role === "Admin"
                            ? "bg-slate-100 text-slate-600"
                            : u.role === "Librarian"
                              ? "bg-orange-50 text-orange-400"
                              : "bg-blue-50 text-blue-500"
                        }`}
                      >
                        {u.role || "Student"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-500"
                            : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(u, "view")}
                        className="p-2 text-slate-400 hover:text-slate-900"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(u, "edit")}
                        className="p-2 text-slate-400 hover:text-slate-900"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal สำหรับ Add / Edit / View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-2xl">
            <h2 className="text-2xl text-black font-bold mb-6">
              {modalMode === "add"
                ? "เพิ่มผู้ใช้งานใหม่"
                : modalMode === "edit"
                  ? "แก้ไขข้อมูล"
                  : "ข้อมูลผู้ใช้งาน"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-black font-bold mb-2">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  disabled={modalMode === "view"}
                  className="w-full p-3 text-gray-700 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-slate-200"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-black font-bold mb-2">อีเมล</label>
                <input
                  type="email"
                  disabled={modalMode === "view"}
                  className="w-full p-3 text-gray-700 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-slate-200"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                />
              </div>

              {modalMode === "add" && (
                <div>
                  <label className="block text-sm text-black font-bold mb-2">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 text-gray-700 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-slate-200"
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-black font-bold mb-2">
                  บทบาท (Role)
                </label>
                <select
                  disabled={modalMode === "view"}
                  className="w-full p-3 text-gray-700 bg-slate-50 border rounded-xl outline-none"
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, role: e.target.value })
                  }
                >
                  <option value="Student">Student</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-black font-bold hover:bg-slate-50"
              >
                {modalMode === "view" ? "ปิด" : "ยกเลิก"}
              </button>
              {modalMode !== "view" && (
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  บันทึกข้อมูล
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
