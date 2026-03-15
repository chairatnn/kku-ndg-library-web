const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Express.js (Frontend)

export async function GET(request) {
  const auth = request.headers.get('authorization') || '';

  const resp = await fetch(`${API_BASE_URL}/me`, {
    headers: auth ? { Authorization: auth } : {},
    cache: 'no-store',
  });

  const data = await resp.json();
  return Response.json(data, { status: resp.status });
}