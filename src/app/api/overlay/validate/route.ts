import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, reason: 'No token provided' });
  }

  const overlayToken = await prisma.overlayToken.findUnique({
    where: { token },
    include: { match: { include: { team1: true, team2: true } } }
  });

  if (!overlayToken) {
    return NextResponse.json({ valid: false, reason: 'Token not found' });
  }

  if (!overlayToken.isActive) {
    return NextResponse.json({ valid: false, reason: 'Token deactivated' });
  }

  if (new Date() > overlayToken.expiresAt) {
    return NextResponse.json({ valid: false, reason: 'Token expired', expiresAt: overlayToken.expiresAt });
  }

  return NextResponse.json({
    valid: true,
    theme: overlayToken.theme,
    matchId: overlayToken.matchId,
    expiresAt: overlayToken.expiresAt,
    match: overlayToken.match
  });
}
