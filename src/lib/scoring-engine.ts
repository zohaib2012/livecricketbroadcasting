import { Ball, WicketType, Innings } from '@/types/cricket';

export interface ScoringResult {
  totalRuns: number;
  totalWickets: number;
  totalBalls: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    total: number;
  };
  batsmanRuns: number;
  batsmanBalls: number;
  bowlerRuns: number;
  bowlerBalls: number;
  bowlerWickets: number;
  bowlerMaidens: number;
  bowlerWides: number;
  bowlerNoBalls: number;
  isOverComplete: boolean;
  shouldSwapStrike: boolean;
  isWicket: boolean;
}

export function calculateBallOutcome(
  runs: number,
  extras: 'wide' | 'noball' | 'bye' | 'legbye' | null,
  isWicket: boolean,
  overBalls: number
): ScoringResult {
  let totalRuns = 0;
  let totalBalls = 0;
  let batsmanRuns = 0;
  let batsmanBalls = 0;
  let bowlerRuns = 0;
  let bowlerBalls = 0;
  let bowlerWickets = 0;
  let bowlerMaidens = 0;
  let bowlerWides = 0;
  let bowlerNoBalls = 0;
  let shouldSwapStrike = false;
  let isOverComplete = false;

  switch (extras) {
    case 'wide':
      totalRuns = runs + 1;
      bowlerRuns = runs + 1;
      bowlerWides = 1;
      batsmanBalls = 0;
      totalBalls = 0;
      bowlerBalls = 0;
      break;

    case 'noball':
      totalRuns = runs + 1;
      bowlerRuns = runs + 1;
      bowlerNoBalls = 1;
      batsmanRuns = runs;
      batsmanBalls = 0;
      totalBalls = 0;
      bowlerBalls = 0;
      break;

    case 'bye':
      totalRuns = runs;
      bowlerRuns = 0;
      bowlerBalls = 1;
      batsmanBalls = 1;
      totalBalls = 1;
      break;

    case 'legbye':
      totalRuns = runs;
      bowlerRuns = 0;
      bowlerBalls = 1;
      batsmanBalls = 1;
      totalBalls = 1;
      break;

    default:
      totalRuns = runs;
      batsmanRuns = runs;
      batsmanBalls = 1;
      totalBalls = 1;
      bowlerRuns = runs;
      bowlerBalls = 1;
      break;
  }

  if (isWicket && extras !== 'wide' && extras !== 'noball') {
    bowlerWickets = 1;
  } else if (isWicket && (extras === 'wide' || extras === 'noball')) {
    bowlerWickets = 1;
  }

  if (extras !== 'wide' && extras !== 'noball') {
    if (runs === 1 || runs === 3) {
      shouldSwapStrike = true;
    }
    if (overBalls === 5) {
      isOverComplete = true;
    }
  } else if (runs === 1 || runs === 3) {
    shouldSwapStrike = true;
  }

  return {
    totalRuns,
    totalWickets: isWicket ? 1 : 0,
    totalBalls,
    extras: {
      wides: extras === 'wide' ? 1 : 0,
      noBalls: extras === 'noball' ? 1 : 0,
      byes: extras === 'bye' ? runs : 0,
      legByes: extras === 'legbye' ? runs : 0,
      total: extras ? runs + (extras === 'wide' || extras === 'noball' ? 1 : 0) : 0,
    },
    batsmanRuns,
    batsmanBalls,
    bowlerRuns,
    bowlerBalls,
    bowlerWickets,
    bowlerMaidens,
    bowlerWides,
    bowlerNoBalls,
    isOverComplete,
    shouldSwapStrike,
    isWicket,
  };
}

export function formatOvers(balls: number): string {
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${completedOvers}.${remainingBalls}`;
}

export function calculateStrikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  return Math.round((runs / balls) * 100 * 100) / 100;
}

export function calculateEconomy(runs: number, balls: number): number {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return Math.round((runs / overs) * 100) / 100;
}

export function calculateRunRate(runs: number, balls: number): number {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return Math.round((runs / overs) * 100) / 100;
}

export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  maxBalls: number,
  ballsBowled: number
): number {
  const runsNeeded = target - currentRuns;
  const ballsRemaining = maxBalls - ballsBowled;
  if (ballsRemaining <= 0) return 0;
  return Math.round((runsNeeded / (ballsRemaining / 6)) * 100) / 100;
}

export function getMaxBalls(format: string, customOvers?: number): number {
  switch (format) {
    case 'T20':
      return 120;
    case 'ODI':
      return 300;
    case 'TEST':
      return Infinity;
    case 'CUSTOM':
      return customOvers ? customOvers * 6 : 120;
    default:
      return 120;
  }
}

export function getWicketDescription(
  wicketType: WicketType,
  bowlerName?: string,
  fielderName?: string
): string {
  switch (wicketType) {
    case 'BOWLED':
      return `b ${bowlerName || ''}`;
    case 'CAUGHT':
      return `c ${fielderName || ''} b ${bowlerName || ''}`;
    case 'LBW':
      return `lbw b ${bowlerName || ''}`;
    case 'RUN_OUT':
      return `run out (${fielderName || ''})`;
    case 'STUMPED':
      return `st b ${bowlerName || ''}`;
    case 'HIT_WICKET':
      return `hit wicket b ${bowlerName || ''}`;
    case 'HANDLED_BALL':
      return 'handled ball';
    case 'TIMED_OUT':
      return 'timed out';
    case 'OBSTRUCTING_FIELD':
      return 'obstructing field';
    default:
      return '';
  }
}

export function getLast6BallsDisplay(balls: Ball[]): string[] {
  return balls.slice(-6).map(ball => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return ball.runs > 1 ? `${ball.runs}wd` : 'wd';
    if (ball.isNoBall) return ball.runs > 1 ? `${ball.runs}nb` : 'nb';
    if (ball.isBye) return `${ball.runs}b`;
    if (ball.isLegBye) return `${ball.runs}lb`;
    return ball.runs.toString();
  });
}
