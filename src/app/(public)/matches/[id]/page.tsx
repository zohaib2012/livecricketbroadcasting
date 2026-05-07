'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSocket } from '@/lib/socket';

export default function PublicMatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch();
    const socket = getSocket();
    socket.emit('join_match', { matchId });
    socket.on('score_updated', fetchMatch);
    return () => { socket.off('score_updated', fetchMatch); };
  }, [matchId]);

  const fetchMatch = async () => {
    const res = await fetch(`/api/matches/${matchId}`);
    const data = await res.json();
    setMatch(data);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!match) return <div className="p-8 text-center text-red-400">Match not found</div>;

  const innings = match.innings?.[0];
  const isLive = match.status === 'LIVE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/tournaments">
          <Button variant="ghost" className="text-white"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tournaments</Button>
        </Link>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white">
                {match.team1?.name} vs {match.team2?.name}
              </CardTitle>
              <Badge variant={isLive ? 'destructive' : 'secondary'} className={isLive ? 'animate-pulse' : ''}>
                {isLive ? '● LIVE' : match.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(match.scheduledAt).toLocaleString()}</span>
              {match.venue?.name && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {match.venue.name}</span>}
            </div>

            {innings && (
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">{innings.battingTeam?.name}</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {innings.totalRuns}/{innings.wickets}
                    </p>
                    <p className="text-gray-400">
                      Overs: {Math.floor(innings.totalBalls / 6)}.{(innings.totalBalls % 6)}
                    </p>
                  </div>
                  {innings.target && (
                    <div className="text-right">
                      <p className="text-gray-400">Target: {innings.target}</p>
                      <p className="text-gray-400">
                        Need {innings.target - innings.totalRuns} runs
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isLive && (
          <div className="text-center">
            <Link href={`/overlay/${matchId}/full`} target="_blank">
              <Button size="lg" className="text-lg">Watch Live Overlay</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
