import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      teamPlayers: { include: { team: true } },
      battingScorecards: {
        include: { innings: { include: { match: { include: { team1: true, team2: true } } } } },
        orderBy: { innings: { createdAt: 'desc' } },
        take: 10,
      },
      bowlingScorecards: {
        include: { innings: { include: { match: { include: { team1: true, team2: true } } } } },
        orderBy: { innings: { createdAt: 'desc' } },
        take: 10,
      },
    },
  });
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(player);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const player = await prisma.player.update({
    where: { id: params.id },
    data: {
      name: body.name,
      role: body.role,
      battingStyle: body.battingStyle,
      bowlingStyle: body.bowlingStyle || null,
      photo: body.photo || null,
    },
  });
  return NextResponse.json(player);
}
