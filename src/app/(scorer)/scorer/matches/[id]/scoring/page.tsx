'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSocket } from '@/lib/socket';
import { Loader2 } from 'lucide-react';

export default function ScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [striker, setStriker] = useState<string>('');
  const [nonStriker, setNonStriker] = useState<string>('');
  const [bowler, setBowler] = useState<string>('');

  const fetchMatch = useCallback(async () => {
    const res = await fetch(`/api/matches/${matchId}`);
    const data = await res.json();
    setMatch(data);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
    const socket = getSocket();
    socket.emit('join_match', { matchId });
    socket.on('score_updated', fetchMatch);
    return () => { socket.off('score_updated', fetchMatch); };
  }, [matchId, fetchMatch]);

  const addBall = async (runs: number, isWicket = false, extraType?: string) => {
    if (!striker || !bowler) return alert('Select striker and bowler');
    
    await fetch(`/api/matches/${matchId}/ball`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batsmanId: striker,
        bowlerId: bowler,
        nonStrikerId: nonStriker,
        runs,
        isWicket,
        isWide: extraType === 'wide',
        isNoBall: extraType === 'noball',
        isBye: extraType === 'bye',
        isLegBye: extraType === 'legbye',
      }),
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;
  if (!match) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">Match not found</div>;

  const innings = match.innings?.[0];
  const battingTeam = innings?.battingTeam || match.team1;
  const bowlingTeam = innings?.bowlingTeam || match.team2;
  const batingPlayers = innings?.battingScorecards?.filter((b: any) => !b.howOut) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{match.team1.name} vs {match.team2.name}</h1>
            <Badge variant={match.status === 'LIVE' ? 'destructive' : 'secondary'} className="mt-2">
              {match.status}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/matches')} className="text-white border-white/20">
            Back to Matches
          </Button>
        </div>

        {innings && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">
                  {battingTeam.name}: {innings.totalRuns}/{innings.wickets}
                </CardTitle>
                <div className="text-right text-white">
                  <p className="text-2xl font-bold">
                    {Math.floor(innings.totalBalls / 6)}.{(innings.totalBalls % 6)}
                  </p>
                  <p className="text-sm text-gray-400">overs</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Score Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[0, 1, 2, 3, 4, 6].map((run) => (
                  <Button
                    key={run}
                    variant="outline"
                    className="h-16 text-2xl font-bold text-white border-white/20 hover:bg-white/10"
                    onClick={() => addBall(run)}
                  >
                    {run}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3 mb-6">
                <Button variant="destructive" onClick={() => addBall(0, true)}>
                  Wicket
                </Button>
                <Button variant="outline" className="text-white border-white/20" onClick={() => addBall(1, false, 'wide')}>
                  Wide
                </Button>
                <Button variant="outline" className="text-white border-white/20" onClick={() => addBall(1, false, 'noball')}>
                  No Ball
                </Button>
                <Button variant="outline" className="text-white border-white/20" onClick={() => addBall(0, false, 'bye')}>
                  Bye
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Select Striker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batingPlayers.map((b: any) => (
                    <button
                      key={b.playerId}
                      onClick={() => setStriker(b.playerId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        striker === b.playerId ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {b.player?.name} ({b.runs})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Select Bowler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {innings?.bowlingScorecards?.map((b: any) => (
                    <button
                      key={b.playerId}
                      onClick={() => setBowler(b.playerId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        bowler === b.playerId ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      {b.player?.name} ({b.overs}-{b.wickets})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
