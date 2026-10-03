import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json({ keys: [] }, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' } });
}
