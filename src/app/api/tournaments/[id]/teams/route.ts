import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: params.id },
    include: { team: { include: { teamPlayers: { include: { player: true } } } } },
  });
  return NextResponse.json(teams.map(t => t.team));
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { teamId } = await request.json();
  
  const entry = await prisma.tournamentTeam.create({
    data: { tournamentId: params.id, teamId },
  });
  
  await prisma.pointsTable.upsert({
    where: { tournamentId_teamId: { tournamentId: params.id, teamId } },
    update: {},
    create: { tournamentId: params.id, teamId },
  });
  
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { teamId } = await request.json();
  
  await prisma.tournamentTeam.delete({
    where: { tournamentId_teamId: { tournamentId: params.id, teamId } },
  });
  
  return NextResponse.json({ success: true });
}
