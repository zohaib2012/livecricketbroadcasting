import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  
  const players = await prisma.player.findMany({
    where: teamId ? { teamPlayers: { some: { teamId } } } : undefined,
    include: { teamPlayers: { include: { team: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, role, battingStyle, bowlingStyle, dateOfBirth, photo, teamId, jerseyNumber } = body;
    
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    
    const player = await prisma.player.create({
      data: {
        name,
        role: role || 'BATSMAN',
        battingStyle: battingStyle || 'RIGHT_HANDED',
        ...(bowlingStyle ? { bowlingStyle } : {}),
        ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        ...(photo ? { photo } : {}),
      },
    });
    
    if (teamId) {
      await prisma.teamPlayer.create({
        data: { teamId, playerId: player.id, jerseyNumber: jerseyNumber || null },
      });
    }
    
    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    console.error('Create player error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create player' }, { status: 500 });
  }
}
