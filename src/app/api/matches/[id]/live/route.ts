import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      tournament: { select: { name: true, format: true } },
      team1: true,
      team2: true,
      innings: {
        orderBy: { inningsNumber: 'desc' },
        take: 1,
        include: {
          battingTeam: true,
          bowlingTeam: true,
          battingScorecards: {
            include: { player: true },
            orderBy: { battingPosition: 'asc' },
          },
          bowlingScorecards: {
            include: { player: true },
            orderBy: { overs: 'desc' },
            take: 1,
          },
          balls: {
            orderBy: [{ overNumber: 'desc' }, { ballNumber: 'desc' }],
            take: 6,
          },
          fallOfWickets: {
            include: { player: true },
            orderBy: { wicketNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const currentInnings = match.innings[0];
  const target = currentInnings?.inningsNumber === 2 ? currentInnings.target : undefined;

  return NextResponse.json({
    match: {
      id: match.id,
      status: match.status,
      team1: match.team1,
      team2: match.team2,
      tournament: match.tournament,
    },
    currentInnings,
    target,
  });
}
