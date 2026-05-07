import { prisma } from '@/lib/prisma'

export async function recalculateTournamentPoints(tournamentId: string) {
  const matches = await prisma.match.findMany({
    where: { tournamentId, status: 'COMPLETED' }
  })
  const tournamentTeams = await prisma.tournamentTeam.findMany({
    where: { tournamentId }
  })

  for (const tt of tournamentTeams) {
    const teamId = tt.teamId
    const teamMatches = matches.filter(m => m.team1Id === teamId || m.team2Id === teamId)
    const played = teamMatches.length
    const won = teamMatches.filter(m => m.winnerId === teamId).length
    const lost = teamMatches.filter(m => m.winnerId && m.winnerId !== teamId).length
    const points = won * 2

    await prisma.pointsTable.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId } },
      update: { played, won, lost, points },
      create: { tournamentId, teamId, played, won, lost, points, nrr: 0 }
    })
  }
}
