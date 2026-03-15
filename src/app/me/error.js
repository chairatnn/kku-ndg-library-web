'use client';

export default function Error({ error, reset }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-red-600">Error: {error?.message || 'Unknown'}</div>
      <button className="rounded-md border px-3 py-2 text-sm" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}