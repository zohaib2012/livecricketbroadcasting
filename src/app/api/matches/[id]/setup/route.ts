import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN','SCORER'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { tossWinnerId, tossDecision, team1XI, team2XI } = await request.json();
  
  if (!tossWinnerId || !tossDecision || !team1XI?.length || !team2XI?.length) {
    return NextResponse.json({ error: 'Missing required setup data' }, { status: 400 });
  }
  
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { team1: true, team2: true },
  });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  
  await prisma.playingXI.deleteMany({ where: { matchId: params.id } });
  
  const allXI = [
    ...team1XI.map((p: any) => ({ ...p, matchId: params.id, teamId: match.team1Id })),
    ...team2XI.map((p: any) => ({ ...p, matchId: params.id, teamId: match.team2Id })),
  ];
  
  await prisma.playingXI.createMany({ data: allXI });
  
  const battingTeamId = tossDecision === 'BAT' ? tossWinnerId 
    : tossWinnerId === match.team1Id ? match.team2Id : match.team1Id;
  const bowlingTeamId = battingTeamId === match.team1Id ? match.team2Id : match.team1Id;
  
  await prisma.innings.upsert({
    where: { matchId_inningsNumber: { matchId: params.id, inningsNumber: 1 } },
    update: {},
    create: {
      matchId: params.id,
      inningsNumber: 1,
      battingTeamId,
      bowlingTeamId,
    },
  });
  
  const battingXI = battingTeamId === match.team1Id ? team1XI : team2XI;
  const innings = await prisma.innings.findUnique({
    where: { matchId_inningsNumber: { matchId: params.id, inningsNumber: 1 } },
  });
  
  if (innings) {
    for (const player of battingXI) {
      await prisma.battingScorecard.upsert({
        where: { inningsId_playerId: { inningsId: innings.id, playerId: player.playerId } },
        update: {},
        create: {
          inningsId: innings.id,
          playerId: player.playerId,
          battingPosition: player.battingOrder,
        },
      });
    }
  }
  
  const updatedMatch = await prisma.match.update({
    where: { id: params.id },
    data: {
      status: 'LIVE',
      tossWinnerId,
      tossDecision,
    },
    include: { team1: true, team2: true, innings: true },
  });
  
  return NextResponse.json(updatedMatch);
}
