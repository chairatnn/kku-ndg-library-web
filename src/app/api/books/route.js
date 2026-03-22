const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  // Extract userId from JWT token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.sub;
    } catch (e) {
      // Invalid token, proceed without userId
    }
  } else {
    console.log('✗ No token found');
  }

  try {
    // สร้าง URL ด้วย query parameters
    const url = new URL(`${API_BASE_URL}/books`);
    url.searchParams.set('search', search);
    if (userId) {
      url.searchParams.set('userId', userId.toString());
    }

    const resp = await fetch(url.toString(), {
      cache: 'no-store',
    });

    const data = await resp.json();
    return Response.json(data, { status: resp.status });
  } catch (error) {
    return Response.json({ message: 'การเชื่อมต่อล้มเหลว' }, { status: 500 });
  }
}