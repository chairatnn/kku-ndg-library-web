// src/app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server';
const { getDashboardData } = require('../../../../repositories/dashboard.repo');

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}