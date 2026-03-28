// import Link from 'next/link';
// import Image from 'next/image';
// import ProtectedRoute from './components/ProtectedRoute';

// const quickLinks = [
//   { label: 'Books', href: '/books', description: 'ดูหน้ารายการหนังสือใน App Router' },
//   { label: 'My Profile', href: '/me', description: 'ตรวจสอบข้อมูลผู้ใช้จาก /api/me' },
//   { label: 'Health', href: '/health', description: 'เช็กสถานะการเชื่อมต่อ API ของระบบ' },
// ];

// export default function HomePage() {
//   return (
//     <ProtectedRoute>
//       <main className="space-y-6">
//         <div className="relative h-48 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm">
//           <Image src="/images/demo.png" alt="KKU Library" fill className="object-cover" priority />
//           <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
//           <div className="absolute inset-x-0 bottom-0 p-6 text-white">
//             <p className="text-sm font-medium text-slate-200">Dashboard</p>
//             <h1 className="mt-1 text-3xl font-bold tracking-tight">KKU Library</h1>
//             <p className="mt-2 max-w-xl text-sm text-slate-200">
//               หน้าหลักหลัง login สำหรับพาไปยัง flow สำคัญของ workshop
//             </p>
//           </div>
//         </div>

//         <div className="grid gap-4 md:grid-cols-3">
//           {quickLinks.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-slate-300"
//             >
//               <h2 className="text-base font-semibold text-slate-900">{item.label}</h2>
//               <p className="mt-2 text-sm text-slate-600">{item.description}</p>
//             </Link>
//           ))}
//         </div>
//       </main>
//     </ProtectedRoute>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { Book, BookCheck, ArrowLeftRight, Users, AlertCircle } from "lucide-react";
import ProtectedRoute from "./components/ProtectedRoute";

export default function DashboardPage() {
  const [data, setData] = useState({
    stats: { totalBooks: 0, availableBooks: 0, currentBorrows: 0, totalUsers: 0, overdueCount: 0 },
    recentBorrows: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const resp = await fetch("http://localhost:3000/api/dashboard/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await resp.json();
        if (resp.ok) {
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  const { stats, recentBorrows } = data;

  return (
    <ProtectedRoute>
      <main className="p-8 bg-slate-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">ภาพรวมระบบห้องสมุด KKU Library</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="หนังสือทั้งหมด" value={stats.totalBooks} icon={Book} />
          <StatCard label="พร้อมให้ยืม" value={stats.availableBooks} icon={BookCheck} />
          <StatCard label="กำลังถูกยืม" value={stats.currentBorrows} icon={ArrowLeftRight} />
          <StatCard label="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} icon={Users} />
        </div>

        {/* Alert Box - ใช้ข้อมูลจริงจาก Database */}
        {Number(stats.overdueCount) > 0 && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shadow-sm transition-all animate-in fade-in">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold text-sm">มีรายการค้างส่ง {stats.overdueCount} รายการ</span>
          </div>
        )}

        {/* Table รายการยืมล่าสุด */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-xl font-bold text-slate-900">รายการยืมล่าสุด</h2>
            <p className="text-sm text-slate-400 mt-1">แสดง 5 รายการล่าสุด</p>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">รหัส</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ผู้ยืม</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">หนังสือ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">วันกำหนดคืน</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentBorrows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-medium text-slate-600">BR{row.id.toString().padStart(3, '0')}</td>
                  <td className="px-6 py-5 text-sm text-slate-800 font-medium">{row.user_name}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">{row.book_title}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">{row.due_date}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      row.status === 'Returned' ? 'bg-slate-100 text-slate-500' :
                      row.status === 'Overdue' ? 'bg-rose-50 text-rose-500' : 
                      'bg-orange-50 text-orange-400'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">{label}</p>
        <span className="text-4xl font-bold text-slate-900 leading-none">{value}</span>
      </div>
      <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Icon className="h-6 w-6" /></div>
    </div>
  );
}