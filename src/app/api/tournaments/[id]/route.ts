import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      admin: { select: { name: true, email: true } },
      tournamentTeams: { include: { team: { include: { teamPlayers: { include: { player: true } } } } } },
      matches: {
        include: { team1: true, team2: true, venue: true },
        orderBy: { scheduledAt: 'asc' },
      },
      pointsTables: { include: { team: true }, orderBy: { points: 'desc' } },
      _count: { select: { matches: true, tournamentTeams: true } },
    },
  });
  
  if (!tournament) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tournament);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const tournament = await prisma.tournament.update({
    where: { id: params.id },
    data: {
      name: body.name,
      format: body.format,
      type: body.type,
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      logo: body.logo,
    },
  });
  
  return NextResponse.json(tournament);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await prisma.tournament.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
