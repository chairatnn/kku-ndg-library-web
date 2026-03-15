import Link from 'next/link';

export default function AccountLayout({ children }) {
  return (
    <div className="space-y-4">
      <nav className="rounded-lg border p-4 text-sm">
        <div className="font-medium">Account</div>
        <div className="mt-2 flex gap-3">
          <Link className="underline" href="/account/me">Me</Link>
          <Link className="underline" href="/account/settings">Settings</Link>
        </div>
      </nav>
      <section className="rounded-lg border p-4">{children}</section>
    </div>
  );
}