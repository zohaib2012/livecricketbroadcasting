import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const teams = await prisma.team.findMany({
    include: { _count: { select: { teamPlayers: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, color, homeGround, logo } = await request.json();
  
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  
  const team = await prisma.team.create({
    data: { name, slug, color: color || '#6366f1', homeGround: homeGround || null, logo: logo || null },
  });
  
  return NextResponse.json(team, { status: 201 });
}
