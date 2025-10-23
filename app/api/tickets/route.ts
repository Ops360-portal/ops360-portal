
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Create = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']).default('MEDIUM'),
});

export async function GET() {
  const data = await prisma.ticket.findMany({ where: { orgId: 'demo_org' }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Create.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const requester = await prisma.user.findFirst({ where: { email: 'admin@demo.local' } });
  if (!requester) return NextResponse.json({ error: 'Seed user missing. Run: npm run db:seed' }, { status: 500 });

  const ticket = await prisma.ticket.create({
    data: { ...parsed.data, orgId: 'demo_org', requesterId: requester.id },
  });
  return NextResponse.json(ticket);
}
