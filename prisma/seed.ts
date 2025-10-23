
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "demo_org" },
    update: {},
    create: { id: "demo_org", name: "Demo Org", domain: "demo.local" },
  });

  const user = await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    update: {},
    create: { email: "admin@demo.local", name: "Demo Admin" },
  });

  await prisma.userOrganization.upsert({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
    update: { role: "ADMIN" },
    create: { userId: user.id, orgId: org.id, role: "ADMIN" },
  });

  await prisma.ticket.create({
    data: {
      title: "Laptop not booting",
      description: "Stuck on vendor logo",
      orgId: org.id,
      requesterId: user.id,
      priority: "HIGH",
    },
  });

  console.log("Seed done →", { org: org.name, admin: user.email });
}

main().finally(async () => prisma.$disconnect());
