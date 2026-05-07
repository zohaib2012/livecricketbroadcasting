import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { playerId, jerseyNumber } = await request.json();
  const entry = await prisma.teamPlayer.create({
    data: { teamId: params.id, playerId, jerseyNumber: jerseyNumber || null },
    include: { player: true },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { playerId } = await request.json();
  await prisma.teamPlayer.delete({
    where: { teamId_playerId: { teamId: params.id, playerId } },
  });
  return NextResponse.json({ success: true });
}
