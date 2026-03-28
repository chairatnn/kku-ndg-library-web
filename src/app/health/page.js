import { headers } from 'next/headers';

async function getHealth() {
    const host = (await headers()).get('host');
    const resp = await fetch(`http://${host}/api/health`, { cache: 'no-store' });
    return resp.json();
}

export default async function HealthPage() {
    const data = await getHealth();
    return (
        <main className="space-y-3">
            <h1 className="text-xl text-black font-semibold">Health</h1>
            <pre className="rounded-md border bg-gray-50 p-3 text-xs text-black">{JSON.stringify(data, null, 2)}</pre>
        </main>
    );
}