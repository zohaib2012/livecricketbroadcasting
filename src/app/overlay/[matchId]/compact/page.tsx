'use client';
import { useEffect, useState } from 'react';
import { getSocket, onOverlayDisplay, onOverlayAnimate, offOverlayDisplay, offOverlayAnimate } from '@/lib/socket';

export default function CompactOverlay({ params }: { params: { matchId: string } }) {
  const [data, setData] = useState<any>(null);
  const [displayMode, setDisplayMode] = useState('DEFAULT');
  const [animation, setAnimation] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/matches/${params.matchId}/live`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});

    const socket = getSocket();
    socket.emit('join_match', { matchId: params.matchId });
    socket.on('score_updated', setData);

    onOverlayDisplay(({ mode }) => setDisplayMode(mode));
    onOverlayAnimate(({ type }) => {
      setAnimation(type);
      setTimeout(() => setAnimation(null), 3000);
    });

    return () => {
      socket.off('score_updated', setData);
      offOverlayDisplay(({ mode }) => setDisplayMode(mode));
      offOverlayAnimate(({ type }) => setAnimation(type));
    };
  }, [params.matchId]);

  if (!data || !data.currentInnings) return <div className="w-full h-10" />;

  const innings = data.currentInnings;
  const match = data.match;

  const AnimationLayer = () => {
    if (!animation) return null;
    const configs: Record<string, { text: string, color: string, bg: string }> = {
      FOUR: { text: 'FOUR!', color: 'text-yellow-300', bg: 'from-yellow-900/80 to-yellow-600/80' },
      SIX: { text: 'SIX!', color: 'text-purple-300', bg: 'from-purple-900/80 to-purple-600/80' },
      WICKET: { text: 'WICKET!', color: 'text-red-300', bg: 'from-red-900/80 to-red-600/80' },
    };
    const cfg = configs[animation];
    if (!cfg) return null;
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${cfg.bg} animate-fade-in`}>
        <div className={`text-8xl font-black tracking-widest ${cfg.color} animate-bounce drop-shadow-2xl`}>
          {cfg.text}
        </div>
      </div>
    );
  };

  const overs = Math.floor(innings.totalBalls / 6);
  const balls = innings.totalBalls % 6;
  const crr = innings.totalBalls === 0 ? '0.00' : (innings.totalRuns / (innings.totalBalls / 6)).toFixed(2);

  const batsmen = innings.battingScorecards || [];
  const bowler = innings.bowlingScorecards?.[0];
  const lastBalls = innings.balls || [];
  const lastBall = lastBalls[0];

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AnimationLayer />
      <div className="flex items-center bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-b-2 border-indigo-500">
        <div className="flex items-center px-4 py-2" style={{ backgroundColor: innings.battingTeam?.color || '#6366f1' }}>
          <span className="text-white font-bold text-sm">{innings.battingTeam?.name?.split(' ').map((w:string) => w[0]).join('').slice(0, 3)}</span>
        </div>
        <div className="px-4 py-2 bg-gray-900">
          <span className="text-white font-bold text-xl">{innings.totalRuns}/{innings.wickets}</span>
          <span className="text-gray-400 text-sm ml-2">({overs}.{balls})</span>
        </div>
        <div className="px-3 py-2 bg-gray-800">
          <span className="text-red-500 font-bold text-xs animate-pulse">● LIVE</span>
        </div>
        {match?.team1?.id !== innings.battingTeamId && (
          <>
            <div className="flex items-center px-4 py-2" style={{ backgroundColor: match?.team1?.color || '#6366f1' }}>
              <span className="text-white font-bold text-sm">{match?.team1?.name?.split(' ').map((w:string) => w[0]).join('').slice(0, 3)}</span>
            </div>
          </>
        )}
        {data.target && (
          <div className="ml-auto px-4 py-2 bg-gray-900 text-right">
            <span className="text-gray-400 text-xs">Target</span>
            <span className="text-white font-bold ml-2">{data.target}</span>
          </div>
        )}
        <div className="ml-auto px-4 py-2 bg-gray-900 text-right">
          <span className="text-gray-400 text-xs">CRR</span>
          <span className="text-white font-bold ml-2">{crr}</span>
        </div>
      </div>

      <div className="flex items-center bg-gray-900/95 text-sm">
        {batsmen.length > 0 && (
          <div className="flex items-center px-4 py-1.5 border-r border-gray-700">
            <span className="text-gray-300">{batsmen[0].player?.name?.split(' ').pop()}</span>
            <span className="text-white font-bold ml-3">{batsmen[0].runs}</span>
            <span className="text-gray-500 ml-1">({batsmen[0].balls})</span>
          </div>
        )}
        {bowler && (
          <div className="px-4 py-1.5 border-r border-gray-700">
            <span className="text-gray-300">{bowler.player?.name?.split(' ').pop()}</span>
            <span className="text-white font-bold ml-3">{bowler.overs}</span>
            <span className="text-gray-500 ml-1">-{bowler.runs}/{bowler.wickets}</span>
          </div>
        )}
        {lastBall && (
          <div className="ml-auto px-3 py-1.5">
            <span className={
              `inline-block w-7 h-7 rounded font-bold text-center leading-7 text-sm ${
                lastBall.isWicket ? 'bg-red-500/20 text-red-400' :
                lastBall.runs === 6 ? 'bg-green-500/20 text-green-400' :
                lastBall.runs === 4 ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-700 text-gray-300'
              }`
            }>
              {lastBall.isWicket ? 'W' : lastBall.runs}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
