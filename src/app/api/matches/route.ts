import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tournamentId = searchParams.get('tournamentId');
  const scorerId = searchParams.get('scorerId');
  
  const matches = await prisma.match.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(tournamentId ? { tournamentId } : {}),
      ...(scorerId ? { scorerId } : {}),
    },
    include: {
      team1: true,
      team2: true,
      venue: true,
      tournament: { select: { name: true, format: true } },
      innings: { select: { totalRuns: true, wickets: true, overs: true, inningsNumber: true, isCompleted: true, battingTeamId: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });
  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { team1Id, team2Id, tournamentId, scheduledAt, venueId, matchNumber, scorerId } = await request.json();
  
  if (!team1Id || !team2Id || !scheduledAt) {
    return NextResponse.json({ error: 'team1Id, team2Id, scheduledAt required' }, { status: 400 });
  }
  
  const match = await prisma.match.create({
    data: {
      team1Id,
      team2Id,
      tournamentId: tournamentId || null,
      scheduledAt: new Date(scheduledAt),
      venueId: venueId || null,
      matchNumber: matchNumber || null,
      scorerId: scorerId || null,
    },
    include: { team1: true, team2: true },
  });
  
  return NextResponse.json(match, { status: 201 });
}
