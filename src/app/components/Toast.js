'use client';

export default function Toast({ open, variant = 'info', message, onClose }) {
  if (!open) return null;

  const base =
    'fixed right-4 top-4 z-50 w-[320px] rounded-md border px-3 py-3 text-sm shadow-sm';

  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : variant === 'success'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-gray-200 bg-white text-gray-900';

  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="leading-5">{message}</div>
        <button
          className="rounded px-1 text-xs text-gray-600 hover:bg-black/5"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
}