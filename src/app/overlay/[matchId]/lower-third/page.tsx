'use client';
import { useEffect, useState } from 'react';
import { getMatchChannel, unsubscribeMatch } from '@/lib/socket';

export default function LowerThirdOverlay({ params }: { params: { matchId: string } }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/matches/${params.matchId}/live`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});

    const channel = getMatchChannel(params.matchId);
    channel.bind('score_updated', setData);

    return () => {
      channel.unbind_all();
      unsubscribeMatch(params.matchId);
    };
  }, [params.matchId]);

  if (!data || !data.currentInnings) return null;

  const innings = data.currentInnings;
  const overs = Math.floor(innings.totalBalls / 6);
  const balls = innings.totalBalls % 6;
  const batsmen = innings.battingScorecards || [];
  const bowler = innings.bowlingScorecards?.[0];
  const striker = batsmen[0];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'transparent' }}>
      <div className="flex items-center">
        <div className="flex items-center px-4 py-2 rounded-l-lg" style={{ backgroundColor: innings.battingTeam?.color || '#6366f1' }}>
          <span className="text-white font-bold mr-3">{innings.battingTeam?.name?.split(' ').map((w:string) => w[0]).join('').slice(0, 3)}</span>
          <span className="text-white text-xl font-black">{innings.totalRuns}/{innings.wickets}</span>
          <span className="text-white/70 text-sm ml-2">({overs}.{balls})</span>
        </div>

        {striker && (
          <div className="flex items-center bg-gray-900 px-4 py-2">
            <span className="text-white font-medium text-sm">{striker.player?.name}</span>
            <span className="text-white font-bold ml-3 text-lg">{striker.runs}</span>
            <span className="text-gray-500 text-sm ml-1">({striker.balls})</span>
            {bowler && (
              <>
                <span className="text-gray-600 mx-3">|</span>
                <span className="text-gray-400 text-xs">{bowler.player?.name?.split(' ').pop()} {bowler.overs}-{bowler.runs}/{bowler.wickets}</span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center bg-red-600 px-3 py-2 rounded-r-lg">
          <span className="text-white text-xs font-bold animate-pulse">● LIVE</span>
        </div>
      </div>
    </div>
  );
}
