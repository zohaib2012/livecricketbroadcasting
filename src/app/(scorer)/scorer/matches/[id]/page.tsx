'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause } from 'lucide-react';

export default function ScorerMatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: '0.0' });

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then(r => r.json())
      .then(data => {
        setMatch(data);
        if (data.innings?.[0]) {
          const inn = data.innings[0];
          setScore({
            runs: inn.totalRuns || 0,
            wickets: inn.wickets || 0,
            overs: `${Math.floor(inn.totalBalls / 6)}.${(inn.totalBalls % 6)}`,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [matchId]);

  if (loading) return <div className="p-8 text-center text-white">Loading match...</div>;
  if (!match) return <div className="p-8 text-center text-red-400">Match not found</div>;

  const battingTeam = match.innings?.[0]?.battingTeam || match.team1;
  const bowlingTeam = match.innings?.[0]?.bowlingTeam || match.team2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Scorer: {match.team1.name} vs {match.team2.name}</h1>
        <Badge variant={match.status === 'LIVE' ? 'live' : 'secondary'}>{match.status}</Badge>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">{battingTeam.name}</CardTitle>
              <p className="text-4xl font-bold text-white mt-2">{score.runs}/{score.wickets}</p>
              <p className="text-gray-400">{score.overs} overs</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Bowling: {bowlingTeam.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 mb-6">
            {[0,1,2,3,4,6].map((run) => (
              <Button key={run} variant="outline" className="text-lg font-bold h-12"
                onClick={() => console.log('Add', run, 'runs')}>
                {run}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="destructive" onClick={() => console.log('Wicket')}>Wicket</Button>
            <Button variant="outline" onClick={() => console.log('Wide')}>Wide</Button>
            <Button variant="outline" onClick={() => console.log('No Ball')}>No Ball</Button>
            <Button variant="outline" onClick={() => console.log('Bye')}>Bye</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
