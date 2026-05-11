import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { triggerMatchEvent } from '@/lib/pusher-server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { matchId, event, data } = await request.json();
  if (!matchId || !event) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await triggerMatchEvent(matchId, event, data);
  return NextResponse.json({ ok: true });
}
