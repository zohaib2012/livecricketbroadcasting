import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['SCORER','ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { matchId, inningsId } = await request.json();
  
  const innings = await prisma.innings.findUnique({
    where: { id: inningsId },
    include: { match: true },
  });
  
  if (!innings) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  await prisma.innings.update({
    where: { id: inningsId },
    data: { isCompleted: true },
  });
  
  const target = innings.totalRuns + 1;
  const secondInnings = await prisma.innings.create({
    data: {
      matchId,
      inningsNumber: 2,
      battingTeamId: innings.bowlingTeamId,
      bowlingTeamId: innings.battingTeamId,
      target,
    },
  });
  
  const playingXI = await prisma.playingXI.findMany({
    where: { matchId, teamId: innings.bowlingTeamId },
    orderBy: { battingOrder: 'asc' },
  });
  
  for (const p of playingXI) {
    await prisma.battingScorecard.create({
      data: {
        inningsId: secondInnings.id,
        playerId: p.playerId,
        battingPosition: p.battingOrder,
      },
    });
  }
  
  return NextResponse.json({ 
    completedInnings: innings, 
    secondInnings, 
    target 
  });
}
