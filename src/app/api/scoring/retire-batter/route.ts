import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { triggerMatchEvent } from '@/lib/pusher-server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['SCORER', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { inningsId, playerId, matchId } = await request.json();
  if (!inningsId || !playerId || !matchId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await prisma.battingScorecard.upsert({
    where: { inningsId_playerId: { inningsId, playerId } },
    update: { howOut: 'RETIRED_HURT' },
    create: {
      inningsId,
      playerId,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      battingPosition: 99,
      howOut: 'RETIRED_HURT',
    },
  });

  await triggerMatchEvent(matchId, 'score_updated', { type: 'retire' });
  return NextResponse.json({ success: true });
}
