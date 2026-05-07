import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = await prisma.overlayToken.findMany({
    include: {
      match: {
        include: { team1: true, team2: true, tournament: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(tokens);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { matchId, theme, label } = await request.json();

  if (!matchId || !theme) {
    return NextResponse.json({ error: 'matchId and theme required' }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const token = await prisma.overlayToken.create({
    data: { matchId, theme, label, expiresAt },
    include: { match: { include: { team1: true, team2: true } } }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const overlayUrl = `${baseUrl}/overlay/${matchId}/full?theme=${theme}&token=${token.token}`;

  return NextResponse.json({ ...token, overlayUrl });
}
