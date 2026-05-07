'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, MapPin, Calendar } from 'lucide-react';

export default function ScorerDashboard() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/matches?scorerId=${(session.user as any).id}`)
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const liveMatches = matches.filter((m: any) => m.status === 'LIVE');
  const upcomingMatches = matches.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'UPCOMING');

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Scorer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your assigned matches and scoring tasks</p>
      </div>

      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live Now
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveMatches.map((match: any) => (
              <Card key={match.id} className="premium-card-hover border-red-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="live">LIVE</Badge>
                    <span className="text-sm text-muted-foreground">{match.tournament?.format || 'T20'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: match.team1?.color || '#6366f1' }}>
                          {match.team1?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold">{match.team1?.name}</span>
                      </div>
                      {match.innings?.find((i: any) => i.battingTeamId === match.team1Id)?.isCompleted ? (
                        <span className="text-2xl font-bold">{match.innings?.find((i: any) => i.battingTeamId === match.team1Id)?.totalRuns}/{match.innings?.find((i: any) => i.battingTeamId === match.team1Id)?.wickets}</span>
                      ) : match.innings?.find((i: any) => i.battingTeamId === match.team1Id) ? (
                        <span className="text-2xl font-bold">{match.innings?.find((i: any) => i.battingTeamId === match.team1Id)?.totalRuns}/{match.innings?.find((i: any) => i.battingTeamId === match.team1Id)?.wickets}</span>
                      ) : (
                        <span className="text-muted-foreground">Yet to bat</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: match.team2?.color || '#6366f1', color: '#fff' }}>
                          {match.team2?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold">{match.team2?.name}</span>
                      </div>
                      {match.innings?.find((i: any) => i.battingTeamId === match.team2Id) ? (
                        <span className="text-2xl font-bold">{match.innings?.find((i: any) => i.battingTeamId === match.team2Id)?.totalRuns}/{match.innings?.find((i: any) => i.battingTeamId === match.team2Id)?.wickets}</span>
                      ) : (
                        <span className="text-muted-foreground">Yet to bat</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{match.venue?.name || 'TBD'}</span>
                  </div>
                  <Link href={`/scorer/scoring/${match.id}`}>
                    <Button className="w-full mt-4"><Target className="w-4 h-4 mr-2" />Continue Scoring<ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMatches.map((match: any) => (
              <Card key={match.id} className="premium-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Upcoming</Badge>
                    <span className="text-sm text-muted-foreground">{match.tournament?.format || 'T20'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: match.team1?.color || '#6366f1' }}>
                          {match.team1?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold">{match.team1?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center"><span className="text-muted-foreground font-medium">vs</span></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: match.team2?.color || '#6366f1', color: '#fff' }}>
                          {match.team2?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold">{match.team2?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(match.scheduledAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{match.venue?.name || 'TBD'}</span>
                  </div>
                  <Link href={`/scorer/scoring/${match.id}`}>
                    <Button variant="outline" className="w-full mt-4"><Target className="w-4 h-4 mr-2" />Start Scoring</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No matches assigned yet.</p>
        </div>
      )}
    </div>
  );
}
