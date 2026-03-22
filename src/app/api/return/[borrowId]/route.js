// const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// export async function POST(request, { params }) {
//   const { borrowId } = params;

//   // รับ Authorization header จาก request
//   const authHeader = request.headers.get('authorization');

//   try {
//     // ส่งต่อไปยัง Express API
//     const resp = await fetch(`${API_BASE_URL}/returns/${borrowId}`, {
//       method: 'POST',
//       headers: {
//         'Authorization': authHeader, // ส่งต่อ token
//       },
//     });

//     const data = await resp.json();
//     return Response.json(data, { status: resp.status });
//   } catch (error) {
//     return Response.json({ message: 'ไม่สามารถดำเนินการคืนได้' }, { status: 500 });
//   }
// }


const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function POST(request, { params }) {
  try {
    // 1. สำคัญมาก: ต้อง await params ก่อนดึงค่าออกไปใช้
    const resolvedParams = await params;
    const borrowId = resolvedParams.borrowId;

    // ตรวจสอบเบื้องต้นว่า borrowId มีค่า
    if (!borrowId) {
      return Response.json({ message: 'ไม่พบรหัสการยืม' }, { status: 400 });
    }

    // 2. รับ Authorization header จาก request
    const authHeader = request.headers.get('authorization');

    // 3. ส่งต่อไปยัง Express API (ตรวจสอบ URL /returns/${borrowId} ให้ตรงกับฝั่ง Express)
    const resp = await fetch(`${API_BASE_URL}/returns/${borrowId}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '', // ป้องกันกรณี authHeader เป็น null
        'Content-Type': 'application/json'
      },
    });

    const data = await resp.json();
    
    // ส่งต่อสถานะและข้อมูลกลับไปที่ Frontend
    return Response.json(data, { status: resp.status });

  } catch (error) {
    console.error("Return API Error:", error);
    return Response.json(
      { message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์หลัก' }, 
      { status: 500 }
    );
  }
}