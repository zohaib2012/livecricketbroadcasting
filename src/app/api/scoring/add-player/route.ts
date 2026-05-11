import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['SCORER', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { teamId, name } = await request.json();
  if (!teamId || !name?.trim()) {
    return NextResponse.json({ error: 'teamId and name required' }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: { name: name.trim(), role: 'BATSMAN' },
  });

  await prisma.teamPlayer.upsert({
    where: { teamId_playerId: { teamId, playerId: player.id } },
    update: {},
    create: { teamId, playerId: player.id },
  });

  return NextResponse.json(player, { status: 201 });
}
