import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { calculateBallOutcome, formatOvers, calculateStrikeRate, calculateEconomy } from '@/lib/scoring-engine';
import { triggerMatchEvent } from '@/lib/pusher-server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !['SCORER','ADMIN','SUPER_ADMIN'].includes((session.user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const {
    matchId,
    inningsId,
    batsmanId,
    nonStrikerId,
    bowlerId,
    runs,
    extras,
    isWicket,
    wicketType,
    fielderId,
  } = body;
  
  if (!matchId || !inningsId || !batsmanId || !bowlerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const innings = await prisma.innings.findUnique({
    where: { id: inningsId },
    include: {
      balls: { orderBy: [{ overNumber: 'desc' }, { ballNumber: 'desc' }], take: 1 },
      battingScorecards: true,
      bowlingScorecards: true,
    },
  });
  
  if (!innings) return NextResponse.json({ error: 'Innings not found' }, { status: 404 });
  if (innings.isCompleted) return NextResponse.json({ error: 'Innings already completed' }, { status: 400 });
  
  const lastBall = innings.balls[0];
  let overNumber = lastBall ? lastBall.overNumber : 0;
  let ballNumber = lastBall ? lastBall.ballNumber + 1 : 1;
  
  const legalBallsInOver = await prisma.ball.count({
    where: {
      inningsId,
      overNumber,
      isWide: false,
      isNoBall: false,
    },
  });
  
  if (legalBallsInOver >= 6) {
    overNumber += 1;
    ballNumber = 1;
  }
  
  const outcome = calculateBallOutcome(runs || 0, extras, isWicket || false, legalBallsInOver);
  
  const ball = await prisma.ball.create({
    data: {
      inningsId,
      overNumber,
      ballNumber,
      batsmanId,
      bowlerId,
      nonStrikerId: nonStrikerId || null,
      runs: outcome.batsmanRuns,
      isWide: extras === 'wide',
      isNoBall: extras === 'noball',
      isBye: extras === 'bye',
      isLegBye: extras === 'legbye',
      isWicket: isWicket || false,
      wicketType: isWicket ? wicketType : null,
      fielderId: isWicket && fielderId ? fielderId : null,
    },
  });
  
  const updatedInnings = await prisma.innings.update({
    where: { id: inningsId },
    data: {
      totalRuns: { increment: outcome.totalRuns },
      wickets: { increment: outcome.totalWickets },
      totalBalls: { increment: outcome.totalBalls },
      overs: parseFloat(formatOvers(innings.totalBalls + outcome.totalBalls)),
      extras: { increment: outcome.extras.total },
      extrasWides: { increment: outcome.extras.wides },
      extrasNoBalls: { increment: outcome.extras.noBalls },
      extrasByes: { increment: outcome.extras.byes },
      extrasLegByes: { increment: outcome.extras.legByes },
    },
  });
  
  const existingBattingCard = await prisma.battingScorecard.findUnique({
    where: { inningsId_playerId: { inningsId, playerId: batsmanId } },
  });
  
  if (existingBattingCard) {
    const newRuns = existingBattingCard.runs + outcome.batsmanRuns;
    const newBalls = existingBattingCard.balls + outcome.batsmanBalls;
    await prisma.battingScorecard.update({
      where: { inningsId_playerId: { inningsId, playerId: batsmanId } },
      data: {
        runs: { increment: outcome.batsmanRuns },
        balls: { increment: outcome.batsmanBalls },
        fours: runs === 4 && !extras ? { increment: 1 } : undefined,
        sixes: runs === 6 && !extras ? { increment: 1 } : undefined,
        strikeRate: calculateStrikeRate(newRuns, newBalls),
        howOut: isWicket ? wicketType : undefined,
      },
    });
  } else {
    await prisma.battingScorecard.create({
      data: {
        inningsId,
        playerId: batsmanId,
        runs: outcome.batsmanRuns,
        balls: outcome.batsmanBalls,
        fours: runs === 4 && !extras ? 1 : 0,
        sixes: runs === 6 && !extras ? 1 : 0,
        strikeRate: calculateStrikeRate(outcome.batsmanRuns, outcome.batsmanBalls),
        battingPosition: innings.wickets + 1,
        howOut: isWicket ? wicketType || null : null,
      },
    });
  }
  
  const existingBowlingCard = await prisma.bowlingScorecard.findUnique({
    where: { inningsId_playerId: { inningsId, playerId: bowlerId } },
  });
  
  const currentBalls = (existingBowlingCard ? Math.floor(existingBowlingCard.overs) * 6 + Math.round((existingBowlingCard.overs % 1) * 10) : 0) + outcome.bowlerBalls;
  const newBowlerOvers = Math.floor(currentBalls / 6) + (currentBalls % 6) / 10;
  const totalBowlerRuns = (existingBowlingCard?.runs || 0) + outcome.bowlerRuns;
  
  if (existingBowlingCard) {
    await prisma.bowlingScorecard.update({
      where: { inningsId_playerId: { inningsId, playerId: bowlerId } },
      data: {
        overs: newBowlerOvers,
        runs: { increment: outcome.bowlerRuns },
        wickets: { increment: outcome.bowlerWickets },
        wides: { increment: outcome.bowlerWides },
        noBalls: { increment: outcome.bowlerNoBalls },
        economy: calculateEconomy(totalBowlerRuns, currentBalls),
      },
    });
  } else {
    await prisma.bowlingScorecard.create({
      data: {
        inningsId,
        playerId: bowlerId,
        overs: newBowlerOvers,
        runs: outcome.bowlerRuns,
        wickets: outcome.bowlerWickets,
        wides: outcome.bowlerWides,
        noBalls: outcome.bowlerNoBalls,
        economy: calculateEconomy(outcome.bowlerRuns, outcome.bowlerBalls),
      },
    });
  }
  
  if (isWicket) {
    await prisma.fallOfWicket.create({
      data: {
        inningsId,
        wicketNumber: updatedInnings.wickets,
        runs: updatedInnings.totalRuns,
        overs: updatedInnings.overs,
        playerId: batsmanId,
      },
    });
  }
  
  const liveData = await buildLiveScoreData(matchId, inningsId);

  await triggerMatchEvent(matchId, 'score_updated', liveData);
  if (ball.runs === 4) {
    await triggerMatchEvent(matchId, 'overlay_animate', { type: 'FOUR' });
  } else if (ball.runs === 6) {
    await triggerMatchEvent(matchId, 'overlay_animate', { type: 'SIX' });
  } else if (ball.isWicket) {
    await triggerMatchEvent(matchId, 'overlay_animate', { type: 'WICKET' });
  }
  
  return NextResponse.json({ ball, innings: updatedInnings, liveData });
}

async function buildLiveScoreData(matchId: string, inningsId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { name: true, format: true } },
      team1: true,
      team2: true,
      innings: {
        where: { id: inningsId },
        include: {
          battingTeam: true,
          bowlingTeam: true,
          battingScorecards: {
            include: { player: true },
            orderBy: { battingPosition: 'asc' },
          },
          bowlingScorecards: {
            include: { player: true },
            orderBy: { overs: 'desc' },
            take: 1,
          },
          balls: {
            orderBy: [{ overNumber: 'desc' }, { ballNumber: 'desc' }],
            take: 6,
          },
          fallOfWickets: {
            include: { player: true },
            orderBy: { wicketNumber: 'asc' },
          },
        },
      },
    },
  });

  const currentInnings = match?.innings[0];
  const target = currentInnings?.inningsNumber === 2 ? currentInnings.target : undefined;

  return {
    match: {
      id: match?.id,
      status: match?.status,
      team1: match?.team1,
      team2: match?.team2,
      tournament: match?.tournament,
    },
    currentInnings,
    target,
  };
}
