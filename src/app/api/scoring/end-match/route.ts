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
    include: {
      match: { include: { innings: { orderBy: { inningsNumber: 'asc' } } } },
    },
  });
  
  if (!innings) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  await prisma.innings.update({ where: { id: inningsId }, data: { isCompleted: true } });
  
  const allInnings = innings.match.innings;
  const inn1 = allInnings.find(i => i.inningsNumber === 1);
  const inn2 = { ...innings, isCompleted: true };
  
  if (!inn1) return NextResponse.json({ error: 'First innings not found' }, { status: 400 });
  
  let winnerId: string | null = null;
  let result = '';
  
  const team1 = await prisma.team.findUnique({ where: { id: inn1.battingTeamId } });
  const team2 = await prisma.team.findUnique({ where: { id: inn2.battingTeamId } });
  
  if (inn2.totalRuns > inn1.totalRuns) {
    winnerId = inn2.battingTeamId;
    const wicketsLeft = 10 - inn2.wickets;
    result = `${team2?.name || 'Team'} won by ${wicketsLeft} wickets`;
  } else if (inn1.totalRuns > inn2.totalRuns) {
    winnerId = inn1.battingTeamId;
    const runsMargin = inn1.totalRuns - inn2.totalRuns;
    result = `${team1?.name || 'Team'} won by ${runsMargin} runs`;
  } else {
    result = 'Match tied';
  }
  
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: { status: 'COMPLETED', winnerId, result },
  });
  
  if (updatedMatch.tournamentId && winnerId) {
    const loserId = winnerId === inn1.battingTeamId ? inn2.battingTeamId : inn1.battingTeamId;
    
    await prisma.pointsTable.update({
      where: { tournamentId_teamId: { tournamentId: updatedMatch.tournamentId, teamId: winnerId } },
      data: {
        played: { increment: 1 },
        won: { increment: 1 },
        points: { increment: 2 },
      },
    });
    
    await prisma.pointsTable.update({
      where: { tournamentId_teamId: { tournamentId: updatedMatch.tournamentId, teamId: loserId } },
      data: {
        played: { increment: 1 },
        lost: { increment: 1 },
      },
    });
  }
  
  return NextResponse.json({ match: updatedMatch, result });
}
