export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SCORER' | 'VIEWER';
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  format: 'T20' | 'ODI' | 'TEST' | 'CUSTOM';
  type: 'LEAGUE' | 'KNOCKOUT' | 'MIXED';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  adminId: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  color: string;
  homeGround: string | null;
}

export interface Player {
  id: string;
  name: string;
  photo: string | null;
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  battingStyle: 'RIGHT_HANDED' | 'LEFT_HANDED';
  bowlingStyle: string | null;
  dateOfBirth: string | null;
}

export interface Match {
  id: string;
  tournamentId: string | null;
  team1Id: string;
  team2Id: string;
  venueId: string | null;
  scheduledAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ABANDONED' | 'RAIN_DELAY';
  tossWinnerId: string | null;
  tossDecision: 'BAT' | 'BOWL' | null;
  result: string | null;
  winnerId: string | null;
  matchNumber: number | null;
  team1?: Team;
  team2?: Team;
  tossWinner?: Team;
  winner?: Team;
  tournament?: Tournament;
  venue?: Venue;
  scorerId?: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number | null;
}

export interface PlayingXI {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  isCaptain: boolean;
  isWicketkeeper: boolean;
  battingOrder: number;
  player?: Player;
}

export interface Innings {
  id: string;
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  inningsNumber: number;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  extrasWides: number;
  extrasNoBalls: number;
  extrasByes: number;
  extrasLegByes: number;
  isDeclared: boolean;
  isCompleted: boolean;
  target: number | null;
  battingTeam?: Team;
  bowlingTeam?: Team;
}

export interface Ball {
  id: string;
  inningsId: string;
  overNumber: number;
  ballNumber: number;
  batsmanId: string;
  bowlerId: string;
  nonStrikerId: string | null;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  isPenalty: boolean;
  isWicket: boolean;
  wicketType: WicketType | null;
  fielderId: string | null;
  timestamp: string;
  batsman?: Player;
  bowler?: Player;
  fielder?: Player;
}

export type WicketType = 
  | 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' 
  | 'HIT_WICKET' | 'HANDLED_BALL' | 'TIMED_OUT' | 'OBSTRUCTING_FIELD';

export interface BattingScorecard {
  id: string;
  inningsId: string;
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  howOut: string | null;
  bowlerId: string | null;
  fielderId: string | null;
  battingPosition: number;
  player?: Player;
}

export interface BowlingScorecard {
  id: string;
  inningsId: string;
  playerId: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  wides: number;
  noBalls: number;
  economy: number;
  player?: Player;
}

export interface FallOfWicket {
  id: string;
  inningsId: string;
  wicketNumber: number;
  runs: number;
  overs: number;
  playerId: string;
  player?: Player;
}

export interface Partnership {
  id: string;
  inningsId: string;
  player1Id: string;
  player2Id: string;
  runs: number;
  balls: number;
}

export interface PointsTable {
  id: string;
  tournamentId: string;
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: number;
  forRuns: number;
  forOvers: number;
  againstRuns: number;
  againstOvers: number;
  team?: Team;
}

export interface LiveScoreData {
  matchId: string;
  innings: Innings | null;
  score: {
    runs: number;
    wickets: number;
    overs: string;
  };
  batsmen: Array<{
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOnStrike: boolean;
  }>;
  bowler: {
    playerId: string;
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  } | null;
  lastBall: {
    runs: number;
    isWicket: boolean;
    isWide: boolean;
    isNoBall: boolean;
    wicketType: string | null;
  } | null;
  last6Balls: Array<{
    runs: number;
    isWicket: boolean;
    isWide: boolean;
    isNoBall: boolean;
    isBye: boolean;
    isLegBye: boolean;
  }>;
  runRate: {
    current: number;
    required: number | null;
  };
  target: number | null;
}

export interface SocketEvents {
  score_updated: LiveScoreData;
  wicket_fell: {
    matchId: string;
    player: { id: string; name: string };
    wicketType: WicketType;
    newBatsman: { id: string; name: string } | null;
  };
  innings_complete: {
    matchId: string;
    inningsNumber: number;
    total: number;
    wickets: number;
    overs: string;
  };
  match_complete: {
    matchId: string;
    winner: { id: string; name: string } | null;
    margin: string;
  };
  match_status: {
    matchId: string;
    status: Match['status'];
  };
}

export type ScoringAction = {
  matchId: string;
  runs?: number;
  extras?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket?: boolean;
  wicketType?: WicketType;
  fielderId?: string;
  batsmanId?: string;
  bowlerId?: string;
};

export type ScorerState = {
  currentBatsmanOnStrike: string;
  currentBatsmanNonStriker: string;
  currentBowler: string;
  currentOver: number;
  currentBall: number;
  battingTeamId: string;
  bowlingTeamId: string;
};

export interface Fixture {
  id: string;
  tournamentId: string;
  team1Id: string | null;
  team2Id: string | null;
  matchNumber: number;
  scheduledAt: string;
  venue: string | null;
  status: Match['status'];
  matchId: string | null;
  team1?: Team;
  team2?: Team;
  match?: Match;
}
