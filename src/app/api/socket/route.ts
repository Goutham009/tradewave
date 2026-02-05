import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // This route exists to handle socket.io polling fallback
  // The actual WebSocket connection is handled by the custom server
  return NextResponse.json({ 
    message: 'Socket.io endpoint - use WebSocket connection',
    status: 'ok' 
  });
}

export async function POST(request: NextRequest) {
  // Handle socket.io polling
  return NextResponse.json({ 
    message: 'Socket.io endpoint - use WebSocket connection',
    status: 'ok' 
  });
}
