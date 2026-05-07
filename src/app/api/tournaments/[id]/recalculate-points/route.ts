import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tournamentId = params.id;

  const matches = await prisma.match.findMany({
    where: { tournamentId, status: 'COMPLETED' },
    include: { team1: true, team2: true, winner: true },
  });

  const matchIds = matches.map(m => m.id);
  const allInnings = await prisma.innings.findMany({
    where: { matchId: { in: matchIds } },
  });

  const matchesWithInnings = matches.map(m => ({
    ...m,
    innings: allInnings.filter(i => i.matchId === m.id),
  }));

  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
    include: { team: true },
  });

  await prisma.pointsTable.deleteMany({ where: { tournamentId } });

  for (const tt of teams) {
    const teamId = tt.teamId;
    let played = 0, won = 0, lost = 0, tied = 0, noResult = 0, points = 0;
    let forRuns = 0, forOvers = 0, againstRuns = 0, againstOvers = 0;

    for (const match of matchesWithInnings) {
      const isTeam1 = match.team1Id === teamId;
      const isTeam2 = match.team2Id === teamId;
      if (!isTeam1 && !isTeam2) continue;

      played++;
      const teamInnings = match.innings?.find((inn: any) => inn.battingTeamId === teamId);
      const oppInnings = match.innings?.find((inn: any) => inn.battingTeamId !== teamId);

      if (teamInnings) {
        forRuns += teamInnings.totalRuns || 0;
        forOvers += teamInnings.totalBalls ? teamInnings.totalBalls / 6 : 0;
      }
      if (oppInnings) {
        againstRuns += oppInnings.totalRuns || 0;
        againstOvers += oppInnings.totalBalls ? oppInnings.totalBalls / 6 : 0;
      }

      if (match.winnerId === teamId) { won++; points += 2; }
      else if (match.winnerId && match.winnerId !== teamId) { lost++; }
      else if (match.result?.includes('tied') || match.result?.includes('Tied')) { tied++; points += 1; }
      else if (!match.winnerId) { noResult++; points += 1; }
    }

    const nrr = againstOvers > 0 && forOvers > 0
      ? (forRuns / forOvers) - (againstRuns / againstOvers)
      : 0;

    await prisma.pointsTable.create({
      data: {
        tournamentId,
        teamId,
        played,
        won,
        lost,
        tied,
        noResult,
        points,
        nrr: Math.round(nrr * 1000) / 1000,
        forRuns,
        forOvers,
        againstRuns,
        againstOvers,
      },
    });
  }

  return NextResponse.json({ success: true });
}
