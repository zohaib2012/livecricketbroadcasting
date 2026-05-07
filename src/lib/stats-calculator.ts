import { prisma } from './prisma';

export async function calculatePlayerStats(playerId: string) {
  const battingStats = await prisma.battingScorecard.findMany({
    where: { playerId },
    include: {
      innings: {
        include: {
          match: true,
        },
      },
    },
  });

  const bowlingStats = await prisma.bowlingScorecard.findMany({
    where: { playerId },
    include: {
      innings: {
        include: {
          match: true,
        },
      },
    },
  });

  let totalRuns = 0;
  let totalBalls = 0;
  let totalFours = 0;
  let totalSixes = 0;
  let totalDismissals = 0;
  let highestScore = 0;
  let fifties = 0;
  let hundreds = 0;

  battingStats.forEach(stat => {
    totalRuns += stat.runs;
    totalBalls += stat.balls;
    totalFours += stat.fours;
    totalSixes += stat.sixes;
    if (stat.runs > highestScore) highestScore = stat.runs;
    if (stat.runs >= 50 && stat.runs < 100) fifties++;
    if (stat.runs >= 100) hundreds++;
    if (stat.howOut) totalDismissals++;
  });

  const battingAverage = totalDismissals > 0 ? totalRuns / totalDismissals : totalRuns;
  const strikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;

  let totalWickets = 0;
  let totalBowlingRuns = 0;
  let totalBowlingBalls = 0;
  let totalMaidens = 0;
  let bestBowling = { wickets: 0, runs: Infinity };
  let fiveWickets = 0;
  let tenWickets = 0;

  bowlingStats.forEach(stat => {
    totalWickets += stat.wickets;
    totalBowlingRuns += stat.runs;
    totalBowlingBalls += Math.floor(stat.overs) * 6 + Math.round((stat.overs % 1) * 10);
    totalMaidens += stat.maidens;
    if (stat.wickets > bestBowling.wickets || 
        (stat.wickets === bestBowling.wickets && stat.runs < bestBowling.runs)) {
      bestBowling = { wickets: stat.wickets, runs: stat.runs };
    }
    if (stat.wickets >= 5) fiveWickets++;
    if (stat.wickets >= 10) tenWickets++;
  });

  const bowlingAverage = totalWickets > 0 ? totalBowlingRuns / totalWickets : 0;
  const economy = totalBowlingBalls > 0 ? (totalBowlingRuns / (totalBowlingBalls / 6)) : 0;

  const matchesPlayed = new Set([
    ...battingStats.map(s => s.innings.matchId),
    ...bowlingStats.map(s => s.innings.matchId),
  ]).size;

  return {
    batting: {
      matches: matchesPlayed,
      innings: battingStats.length,
      runs: totalRuns,
      balls: totalBalls,
      average: Math.round(battingAverage * 100) / 100,
      strikeRate: Math.round(strikeRate * 100) / 100,
      hundreds,
      fifties,
      fours: totalFours,
      sixes: totalSixes,
      highestScore,
    },
    bowling: {
      matches: matchesPlayed,
      innings: bowlingStats.length,
      overs: totalBowlingBalls / 6,
      maidens: totalMaidens,
      runs: totalBowlingRuns,
      wickets: totalWickets,
      average: Math.round(bowlingAverage * 100) / 100,
      economy: Math.round(economy * 100) / 100,
      best: `${bestBowling.wickets}/${bestBowling.runs === Infinity ? 0 : bestBowling.runs}`,
      fiveWickets,
      tenWickets,
    },
  };
}

export async function calculateTournamentStats(tournamentId: string) {
  const matches = await prisma.match.findMany({
    where: { tournamentId },
    include: {
      innings: {
        include: {
          battingScorecards: { include: { player: true } },
          bowlingScorecards: { include: { player: true } },
          fallOfWickets: { include: { player: true } },
        },
      },
    },
  });

  const topScorers: Record<string, { playerId: string; name: string; runs: number; innings: number }> = {};
  const topWickets: Record<string, { playerId: string; name: string; wickets: number; innings: number }> = {};

  matches.forEach(match => {
    match.innings.forEach(innings => {
      innings.battingScorecards.forEach(card => {
        if (!topScorers[card.playerId]) {
          topScorers[card.playerId] = {
            playerId: card.playerId,
            name: card.player?.name || 'Unknown',
            runs: 0,
            innings: 0,
          };
        }
        topScorers[card.playerId].runs += card.runs;
        topScorers[card.playerId].innings++;
      });

      innings.bowlingScorecards.forEach(card => {
        if (!topWickets[card.playerId]) {
          topWickets[card.playerId] = {
            playerId: card.playerId,
            name: card.player?.name || 'Unknown',
            wickets: 0,
            innings: 0,
          };
        }
        topWickets[card.playerId].wickets += card.wickets;
        topWickets[card.playerId].innings++;
      });
    });
  });

  return {
    topScorers: Object.values(topScorers)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10),
    topWickets: Object.values(topWickets)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 10),
    totalMatches: matches.length,
    completedMatches: matches.filter(m => m.status === 'COMPLETED').length,
  };
}

export async function updatePointsTable(tournamentId: string) {
  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true },
  });

  await prisma.pointsTable.deleteMany({ where: { tournamentId } });

  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'COMPLETED',
    },
    include: {
      innings: true,
    },
  });

  const teamStats: Record<string, {
    played: number; won: number; lost: number; tied: number; noResult: number;
    points: number; forRuns: number; forBalls: number; againstRuns: number; againstBalls: number;
  }> = {};

  teams.forEach(team => {
    teamStats[team.teamId] = {
      played: 0, won: 0, lost: 0, tied: 0, noResult: 0,
      points: 0, forRuns: 0, forBalls: 0, againstRuns: 0, againstBalls: 0,
    };
  });

  matches.forEach(match => {
    if (!match.team1Id || !match.team2Id) return;

    const t1 = teamStats[match.team1Id];
    const t2 = teamStats[match.team2Id];
    if (!t1 || !t2) return;

    t1.played++;
    t2.played++;

    const inn1 = match.innings.find(i => i.inningsNumber === 1);
    const inn2 = match.innings.find(i => i.inningsNumber === 2);

    if (inn1) {
      t1.forRuns += inn1.totalRuns;
      t1.forBalls += inn1.totalBalls;
      t2.againstRuns += inn1.totalRuns;
      t2.againstBalls += inn1.totalBalls;
    }
    if (inn2) {
      t2.forRuns += inn2.totalRuns;
      t2.forBalls += inn2.totalBalls;
      t1.againstRuns += inn2.totalRuns;
      t1.againstBalls += inn2.totalBalls;
    }

    if (match.winnerId === match.team1Id) {
      t1.won++;
      t2.lost++;
      t1.points += 2;
    } else if (match.winnerId === match.team2Id) {
      t2.won++;
      t1.lost++;
      t2.points += 2;
    } else if (match.result?.toLowerCase().includes('tie')) {
      t1.tied++;
      t2.tied++;
      t1.points += 1;
      t2.points += 1;
    } else {
      t1.noResult++;
      t2.noResult++;
    }
  });

  for (const [teamId, stats] of Object.entries(teamStats)) {
    const forOvers = stats.forBalls / 6;
    const againstOvers = stats.againstBalls / 6;
    const forRR = forOvers > 0 ? stats.forRuns / forOvers : 0;
    const againstRR = againstOvers > 0 ? stats.againstRuns / againstOvers : 0;
    const nrr = Math.round((forRR - againstRR) * 1000) / 1000;

    await prisma.pointsTable.create({
      data: {
        tournamentId,
        teamId,
        played: stats.played,
        won: stats.won,
        lost: stats.lost,
        tied: stats.tied,
        noResult: stats.noResult,
        points: stats.points,
        nrr,
        forRuns: stats.forRuns,
        forOvers,
        againstRuns: stats.againstRuns,
        againstOvers,
      },
    });
  }
}
