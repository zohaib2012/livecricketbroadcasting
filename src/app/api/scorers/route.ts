import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const scorers = await prisma.user.findMany({
    where: { role: 'SCORER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(scorers);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, email, password } = await request.json();
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const scorer = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'SCORER' },
    select: { id: true, name: true, email: true, role: true },
  });
  
  return NextResponse.json(scorer, { status: 201 });
}
