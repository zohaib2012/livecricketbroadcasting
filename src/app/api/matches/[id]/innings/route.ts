import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !['SCORER', 'ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const matchId = params.id;
  const { battingTeamId, bowlingTeamId, inningsNumber } = await request.json();

  const innings = await prisma.innings.create({
    data: {
      matchId,
      battingTeamId,
      bowlingTeamId,
      inningsNumber,
    },
  });

  return NextResponse.json(innings, { status: 201 });
}
