import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['SCORER','ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { inningsId } = await request.json();
  
  const lastBall = await prisma.ball.findFirst({
    where: { inningsId },
    orderBy: [{ overNumber: 'desc' }, { ballNumber: 'desc' }],
  });
  
  if (!lastBall) return NextResponse.json({ error: 'No balls to undo' }, { status: 400 });
  
  const innings = await prisma.innings.findUnique({ where: { id: inningsId } });
  if (!innings) return NextResponse.json({ error: 'Innings not found' }, { status: 404 });
  
  const isLegalBall = !lastBall.isWide && !lastBall.isNoBall;
  const extrasTotal = (lastBall.isWide || lastBall.isNoBall ? 1 : 0)
    + (lastBall.isBye || lastBall.isLegBye ? lastBall.runs : 0);
  const totalRunsScored = lastBall.runs + (lastBall.isWide || lastBall.isNoBall ? 1 : 0);
  
  await prisma.innings.update({
    where: { id: inningsId },
    data: {
      totalRuns: { decrement: totalRunsScored },
      wickets: lastBall.isWicket ? { decrement: 1 } : undefined,
      totalBalls: isLegalBall ? { decrement: 1 } : undefined,
      extras: { decrement: extrasTotal },
      extrasWides: lastBall.isWide ? { decrement: 1 } : undefined,
      extrasNoBalls: lastBall.isNoBall ? { decrement: 1 } : undefined,
    },
  });
  
  await prisma.battingScorecard.update({
    where: { inningsId_playerId: { inningsId, playerId: lastBall.batsmanId } },
    data: {
      runs: { decrement: lastBall.runs },
      balls: isLegalBall ? { decrement: 1 } : undefined,
      fours: lastBall.runs === 4 ? { decrement: 1 } : undefined,
      sixes: lastBall.runs === 6 ? { decrement: 1 } : undefined,
      howOut: lastBall.isWicket ? null : undefined,
    },
  });
  
  await prisma.bowlingScorecard.update({
    where: { inningsId_playerId: { inningsId, playerId: lastBall.bowlerId } },
    data: {
      runs: { decrement: lastBall.runs + (lastBall.isWide || lastBall.isNoBall ? 1 : 0) },
      wickets: lastBall.isWicket && !lastBall.isWide ? { decrement: 1 } : undefined,
      wides: lastBall.isWide ? { decrement: 1 } : undefined,
      noBalls: lastBall.isNoBall ? { decrement: 1 } : undefined,
    },
  });
  
  if (lastBall.isWicket) {
    await prisma.fallOfWicket.deleteMany({
      where: { inningsId, playerId: lastBall.batsmanId },
    });
  }
  
  await prisma.ball.delete({ where: { id: lastBall.id } });
  
  return NextResponse.json({ success: true, undoneBall: lastBall });
}
