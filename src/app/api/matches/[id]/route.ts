import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { recalculateTournamentPoints } from '@/lib/points-calculator';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      team1: { include: { teamPlayers: { include: { player: true } } } },
      team2: { include: { teamPlayers: { include: { player: true } } } },
      venue: true,
      tournament: true,
      tossWinner: true,
      winner: true,
      scorer: { select: { id: true, name: true, email: true } },
      playingXI: { include: { player: true, team: true }, orderBy: { battingOrder: 'asc' } },
      innings: {
        include: {
          battingTeam: true,
          bowlingTeam: true,
          battingScorecards: {
            include: { player: true, bowler: true, fielder: true },
            orderBy: { battingPosition: 'asc' },
          },
          bowlingScorecards: {
            include: { player: true },
            orderBy: { overs: 'desc' },
          },
          fallOfWickets: { include: { player: true }, orderBy: { wicketNumber: 'asc' } },
          balls: { orderBy: [{ overNumber: 'asc' }, { ballNumber: 'asc' }], take: 6 },
        },
      },
    },
  });
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(match);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const match = await prisma.match.update({
    where: { id: params.id },
    data: {
      status: body.status,
      scorerId: body.scorerId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      result: body.result,
      winnerId: body.winnerId,
    },
    include: { team1: true, team2: true },
  });

  if (body.status === 'COMPLETED' && body.winnerId && match.tournamentId) {
    await recalculateTournamentPoints(match.tournamentId);
  }

  return NextResponse.json(match);
}
