import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { WicketType } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !['SCORER', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const matchId = params.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { innings: { orderBy: { inningsNumber: 'desc' }, take: 1 } },
  });

  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  const currentInnings = match.innings[0];
  if (!currentInnings || currentInnings.isCompleted) {
    return NextResponse.json({ error: 'No active innings' }, { status: 400 });
  }

  const overNumber = Math.floor(currentInnings.totalBalls / 6);
  const ballNumber = currentInnings.totalBalls % 6;

  const ball = await prisma.ball.create({
    data: {
      inningsId: currentInnings.id,
      overNumber,
      ballNumber,
      batsmanId: data.batsmanId,
      bowlerId: data.bowlerId,
      nonStrikerId: data.nonStrikerId,
      runs: data.runs || 0,
      isWide: data.isWide || false,
      isNoBall: data.isNoBall || false,
      isBye: data.isBye || false,
      isLegBye: data.isLegBye || false,
      isWicket: data.isWicket || false,
      wicketType: data.wicketType,
      fielderId: data.fielderId,
    },
    include: {
      batsman: true,
      bowler: true,
      fielder: true,
    },
  });

  const runs = data.runs || 0;
  const isExtra = data.isWide || data.isNoBall || data.isBye || data.isLegBye;
  const ballRuns = isExtra && !data.isBye && !data.isLegBye ? runs + (data.isWide ? 1 : 1) : runs;
  const totalRuns = data.isWide || data.isNoBall ? runs + 1 : runs;

  await prisma.innings.update({
    where: { id: currentInnings.id },
    data: {
      totalRuns: { increment: totalRuns },
      wickets: data.isWicket ? { increment: 1 } : undefined,
      totalBalls: (data.isWide || data.isNoBall) ? undefined : { increment: 1 },
      overs: (data.isWide || data.isNoBall) ? undefined : { set: overNumber + (ballNumber + 1) / 10 },
      extras: { increment: (data.isWide ? 1 : 0) + (data.isNoBall ? 1 : 0) },
      extrasWides: data.isWide ? { increment: 1 } : undefined,
      extrasNoBalls: data.isNoBall ? { increment: 1 } : undefined,
      extrasByes: data.isBye ? { increment: runs } : undefined,
      extrasLegByes: data.isLegBye ? { increment: runs } : undefined,
    },
  });

  if (data.isWicket) {
    await prisma.fallOfWicket.create({
      data: {
        inningsId: currentInnings.id,
        wicketNumber: currentInnings.wickets + 1,
        runs: currentInnings.totalRuns + totalRuns,
        overs: currentInnings.overs,
        playerId: data.batsmanId,
      },
    });
  }

  const io = (global as any).__socketio;
  if (io) {
    io.to(`match_${matchId}`).emit('score_updated', { ball, inningsId: currentInnings.id });
  }

  return NextResponse.json(ball);
}
