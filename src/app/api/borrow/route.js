const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function POST(request) {
  // 1. รับ Token จาก Header ที่ส่งมาจาก Frontend
  const authHeader = request.headers.get('authorization');
  const body = await request.json();

  try {
    // 2. Forward ต่อไปยัง Express พร้อมแนบ Token และข้อมูลการยืม
    const resp = await fetch(`${API_BASE_URL}/borrows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // ส่งต่อ Token ไปให้ Express ตรวจสอบ
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return Response.json(data, { status: resp.status });
  } catch (error) {
    return Response.json({ message: 'ไม่สามารถดำเนินการยืมได้' }, { status: 500 });
  }
}