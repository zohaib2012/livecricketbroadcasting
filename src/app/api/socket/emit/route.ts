import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { event, room, data } = await request.json();
  
  const io = (global as any).__socketio;
  
  if (!io) {
    return NextResponse.json({ error: 'Socket not initialized' }, { status: 500 });
  }
  
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
  
  return NextResponse.json({ success: true });
}
