import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // Users
  const adminPwd = await bcrypt.hash('admin123', 10);
  const scorerPwd = await bcrypt.hash('scorer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@criclive.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@criclive.com', password: adminPwd, role: 'SUPER_ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'scorer@criclive.com' },
    update: {},
    create: { name: 'Scorer', email: 'scorer@criclive.com', password: scorerPwd, role: 'SCORER' },
  });
  console.log('✅ Users: admin@criclive.com / admin123 | scorer@criclive.com / scorer123');

  // Teams
  const mi = await prisma.team.upsert({
    where: { slug: 'mumbai-indians' },
    update: {},
    create: { name: 'Mumbai Indians', slug: 'mumbai-indians', color: '#004BA0', homeGround: 'Wankhede Stadium' },
  });
  const csk = await prisma.team.upsert({
    where: { slug: 'chennai-super-kings' },
    update: {},
    create: { name: 'Chennai Super Kings', slug: 'chennai-super-kings', color: '#FDB913', homeGround: 'Chepauk Stadium' },
  });
  console.log('✅ Teams: Mumbai Indians | Chennai Super Kings');

  // Players for MI (11)
  const miPlayers = [
    { name: 'Rohit Sharma',    role: 'BATSMAN',      batting: 'RIGHT_HANDED', jersey: 45 },
    { name: 'Ishan Kishan',    role: 'WICKET_KEEPER', batting: 'LEFT_HANDED',  jersey: 32 },
    { name: 'Suryakumar Yadav',role: 'BATSMAN',      batting: 'RIGHT_HANDED', jersey: 73 },
    { name: 'Tilak Varma',     role: 'BATSMAN',      batting: 'LEFT_HANDED',  jersey: 9  },
    { name: 'Hardik Pandya',   role: 'ALL_ROUNDER',  batting: 'RIGHT_HANDED', jersey: 33 },
    { name: 'Tim David',       role: 'ALL_ROUNDER',  batting: 'RIGHT_HANDED', jersey: 8  },
    { name: 'Krunal Pandya',   role: 'ALL_ROUNDER',  batting: 'LEFT_HANDED',  jersey: 24 },
    { name: 'Piyush Chawla',   role: 'BOWLER',       batting: 'RIGHT_HANDED', jersey: 77 },
    { name: 'Jasprit Bumrah',  role: 'BOWLER',       batting: 'RIGHT_HANDED', jersey: 93 },
    { name: 'Trent Boult',     role: 'BOWLER',       batting: 'RIGHT_HANDED', jersey: 18 },
    { name: 'Mohammad Nabi',   role: 'ALL_ROUNDER',  batting: 'RIGHT_HANDED', jersey: 10 },
  ];

  // Players for CSK (11)
  const cskPlayers = [
    { name: 'Ruturaj Gaikwad', role: 'BATSMAN',      batting: 'RIGHT_HANDED', jersey: 31 },
    { name: 'Devon Conway',    role: 'BATSMAN',      batting: 'LEFT_HANDED',  jersey: 11 },
    { name: 'Ajinkya Rahane',  role: 'BATSMAN',      batting: 'RIGHT_HANDED', jersey: 3  },
    { name: 'MS Dhoni',        role: 'WICKET_KEEPER', batting: 'RIGHT_HANDED', jersey: 7  },
    { name: 'Shivam Dube',     role: 'ALL_ROUNDER',  batting: 'LEFT_HANDED',  jersey: 4  },
    { name: 'Ravindra Jadeja', role: 'ALL_ROUNDER',  batting: 'LEFT_HANDED',  jersey: 8  },
    { name: 'Deepak Chahar',   role: 'BOWLER',       batting: 'RIGHT_HANDED', jersey: 90 },
    { name: 'Tushar Deshpande',role: 'BOWLER',       batting: 'RIGHT_HANDED', jersey: 35 },
    { name: 'Matheesha Pathirana', role: 'BOWLER',   batting: 'RIGHT_HANDED', jersey: 70 },
    { name: 'Moeen Ali',       role: 'ALL_ROUNDER',  batting: 'LEFT_HANDED',  jersey: 18 },
    { name: 'Rachin Ravindra', role: 'BATSMAN',      batting: 'LEFT_HANDED',  jersey: 54 },
  ];

  for (const p of miPlayers) {
    let player = await prisma.player.findFirst({ where: { name: p.name } });
    if (!player) {
      player = await prisma.player.create({
        data: { name: p.name, role: p.role as any, battingStyle: p.batting as any },
      });
    }
    await prisma.teamPlayer.upsert({
      where: { teamId_playerId: { teamId: mi.id, playerId: player.id } },
      update: { jerseyNumber: p.jersey },
      create: { teamId: mi.id, playerId: player.id, jerseyNumber: p.jersey },
    });
  }
  console.log('✅ MI Players: 11 added');

  for (const p of cskPlayers) {
    let player = await prisma.player.findFirst({ where: { name: p.name } });
    if (!player) {
      player = await prisma.player.create({
        data: { name: p.name, role: p.role as any, battingStyle: p.batting as any },
      });
    }
    await prisma.teamPlayer.upsert({
      where: { teamId_playerId: { teamId: csk.id, playerId: player.id } },
      update: { jerseyNumber: p.jersey },
      create: { teamId: csk.id, playerId: player.id, jerseyNumber: p.jersey },
    });
  }
  console.log('✅ CSK Players: 11 added');

  // Tournament
  const tournament = await prisma.tournament.upsert({
    where: { slug: 'test-t20-2026' },
    update: {},
    create: {
      name: 'Test T20 League 2026',
      slug: 'test-t20-2026',
      format: 'T20',
      type: 'LEAGUE',
      status: 'ONGOING',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
      adminId: admin.id,
    },
  });
  await prisma.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: mi.id } },
    update: {},
    create: { tournamentId: tournament.id, teamId: mi.id },
  });
  await prisma.tournamentTeam.upsert({
    where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: csk.id } },
    update: {},
    create: { tournamentId: tournament.id, teamId: csk.id },
  });
  console.log('✅ Tournament: Test T20 League 2026 (MI + CSK)');

  // Match
  const existing = await prisma.match.findFirst({ where: { team1Id: mi.id, team2Id: csk.id, status: 'SCHEDULED' } });
  if (!existing) {
    await prisma.match.create({
      data: {
        team1Id: mi.id,
        team2Id: csk.id,
        tournamentId: tournament.id,
        status: 'SCHEDULED',
        scheduledAt: new Date(),
      },
    });
  }
  console.log('✅ Match: MI vs CSK (SCHEDULED)');
  console.log('\n🎉 Seed complete! Login at http://localhost:3001');
  console.log('   Admin:  admin@criclive.com  / admin123');
  console.log('   Scorer: scorer@criclive.com / scorer123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
