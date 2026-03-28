'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearSession } from './lib/session';
import {
  Activity,
  BookOpen,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  RotateCcw,     // เพิ่มไอคอนสำหรับ Return
  ClipboardList,  // เพิ่มไอคอนสำหรับ Borrows
  CircleDollarSign, // เพิ่ม (สำหรับ Fines)
  Settings,         // เพิ่ม
} from 'lucide-react';

const AUTH_ROUTES = new Set(['/login', '/register']);

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Books', href: '/books', icon: BookOpen },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Borrows', href: '/borrows', icon: ClipboardList },
  { label: 'Return', href: '/return', icon: RotateCcw },
  // { label: 'Fines', href: '/fines', icon: CircleDollarSign },
  { label: 'My Profile', href: '/me', icon: User },
  { label: 'Health', href: '/health', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    async function syncProfile() {
      const storedName = window.localStorage.getItem('memberName');
      const storedRole = window.localStorage.getItem('memberRole');
      const token = window.localStorage.getItem('accessToken');

      if (storedName) {
        setDisplayName(storedName);
      }

      if (storedRole) {
        setRoleLabel(storedRole);
      }

      if (!token) {
        return;
      }

      try {
        const resp = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await resp.json();

        if (!resp.ok) {
          return;
        }

        const user = json?.user || json?.data || json;
        const nextName = user?.name || user?.email || storedName || '';
        const nextRole = user?.role || storedRole || 'User';

        if (nextName) {
          setDisplayName(nextName);
          window.localStorage.setItem('memberName', nextName);
        }

        if (nextRole) {
          setRoleLabel(nextRole);
          window.localStorage.setItem('memberRole', nextRole);
        }
      } catch {
        // Keep the last known user info in localStorage if profile sync fails.
      }
    }

    syncProfile();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isAuthRoute) {
    return children;
  }

  function isActive(href) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    clearSession();
    window.location.href = '/login';
  }

  const nameForAvatar = displayName.trim();
  const avatarLabel = nameForAvatar
    ? nameForAvatar
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    : 'U';

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <BookOpen className="h-6 w-6 text-slate-900" />
          <span className="text-lg font-bold text-slate-900">KKU Library</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            // ถ้าเป็นเมนู Return ให้โชว์เฉพาะ Admin เท่านั้น
            // if (item.label === 'Return' && roleLabel !== 'Admin') return null;

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white'
                    : 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{displayName || 'User'}</p>
              <p className="text-xs text-slate-500">{roleLabel || 'User'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {avatarLabel}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 rounded-md p-2 text-rose-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}