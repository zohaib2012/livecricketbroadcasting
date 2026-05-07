import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { matchId } = await request.json();
  
  await prisma.match.update({
    where: { id: matchId },
    data: { scorerId: params.id },
  });
  
  await prisma.matchAssignment.upsert({
    where: { matchId_scorerId: { matchId, scorerId: params.id } },
    update: {},
    create: { matchId, scorerId: params.id },
  });
  
  return NextResponse.json({ success: true });
}
