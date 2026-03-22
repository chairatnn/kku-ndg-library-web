const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Express.js (Frontend)

export async function POST(request) {
  const body = await request.json();

  const resp = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  return Response.json(data, { status: resp.status });
}