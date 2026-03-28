import { NextResponse } from "next/server";

const API_BASE = "http://localhost:3000/api";

// --- 1. GET: ดึงข้อมูลหนังสือรายเล่ม ---
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const resp = await fetch(`${API_BASE}/books/${id}`, {
      cache: "no-store", // ป้องกันการจำค่าเก่า เพื่อให้ได้ข้อมูลล่าสุดเสมอ
    });

    const json = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { message: json.message || "ไม่พบข้อมูลหนังสือ" },
        { status: resp.status }
      );
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { message: "เชื่อมต่อ Backend ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

// --- 2. PUT: อัปเดตข้อมูลหนังสือ ---
export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const body = await req.json();
    const token = req.headers.get("authorization"); // ดึง Token จาก Frontend เพื่อส่งต่อ

    const resp = await fetch(`${API_BASE}/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { message: json.message || "แก้ไขข้อมูลไม่สำเร็จ" },
        { status: resp.status }
      );
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย" },
      { status: 500 }
    );
  }
}