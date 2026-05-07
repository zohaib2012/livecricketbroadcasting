import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  const tournaments = await prisma.tournament.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      admin: { select: { name: true } },
      _count: { select: { matches: true, tournamentTeams: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { name, format, type, startDate, endDate, logo } = body;
  
  if (!name || !format || !type || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  
  const tournament = await prisma.tournament.create({
    data: {
      name,
      slug,
      format,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      logo: logo || null,
      adminId: (session.user as any).id,
    },
  });
  
  return NextResponse.json(tournament, { status: 201 });
}
