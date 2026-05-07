import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const scorerPassword = await bcrypt.hash('scorer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@criclive.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@criclive.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const scorer = await prisma.user.upsert({
    where: { email: 'scorer@criclive.com' },
    update: {},
    create: {
      name: 'Scorer User',
      email: 'scorer@criclive.com',
      password: scorerPassword,
      role: 'SCORER',
    },
  });

  console.log('✅ Users created:');
  console.log('📧 admin@criclive.com / admin123');
  console.log('📧 scorer@criclive.com / scorer123');

  const team1 = await prisma.team.upsert({
    where: { slug: 'mumbai-indians' },
    update: {},
    create: {
      name: 'Mumbai Indians',
      slug: 'mumbai-indians',
      color: '#004BA0',
      homeGround: 'Wankhede Stadium',
    },
  });

  const team2 = await prisma.team.upsert({
    where: { slug: 'chennai-super-kings' },
    update: {},
    create: {
      name: 'Chennai Super Kings',
      slug: 'chennai-super-kings',
      color: '#FFFF00',
      homeGround: 'M.A. Chidambaram Stadium',
    },
  });

  console.log('✅ Teams created');

  const tournament = await prisma.tournament.upsert({
    where: { slug: 'kutch-t20-2025' },
    update: {},
    create: {
      name: 'Kutch T20 League 2025',
      slug: 'kutch-t20-2025',
      format: 'T20',
      type: 'LEAGUE',
      status: 'ONGOING',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      adminId: admin.id,
    },
  });

  await prisma.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team1.id } },
    update: {},
    create: { tournamentId: tournament.id, teamId: team1.id },
  });

  await prisma.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team2.id } },
    update: {},
    create: { tournamentId: tournament.id, teamId: team2.id },
  });

  console.log('✅ Tournament created with teams');
  console.log('🏏 Setup complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
