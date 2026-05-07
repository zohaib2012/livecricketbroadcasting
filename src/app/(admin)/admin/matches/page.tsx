'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Plus, Eye, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-muted-foreground mt-1">{matches.length} matches total</p>
        </div>
        <Link href="/admin/matches/create">
          <Button><Plus className="w-4 h-4 mr-2" />Create Match</Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No matches yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m: any) => (
            <Card key={m.id} className="premium-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {m.tournament && <span className="text-sm text-muted-foreground">{m.tournament.name} • {m.tournament.format}</span>}
                  <Badge variant={m.status === 'LIVE' ? 'live' : m.status === 'COMPLETED' ? 'success' : m.status === 'UPCOMING' ? 'secondary' : 'outline'}>
                    {m.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 mb-4">
                  <div className="text-right">
                    <h3 className="font-semibold text-lg">{m.team1?.name}</h3>
                  </div>
                  <div className="text-center text-muted-foreground font-semibold">VS</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{m.team2?.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">{new Date(m.scheduledAt).toLocaleString()}</span>
                  <div className="flex gap-2">
                    {(m.status === 'LIVE') && (
                      <Link href={`/scorer/scoring/${m.id}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-1" />Score
                        </Button>
                      </Link>
                    )}
                    {m.status === 'COMPLETED' && (
                      <Link href={`/admin/matches/${m.id}/result`}>
                        <Button variant="outline" size="sm">Result</Button>
                      </Link>
                    )}
                    <Link href={`/admin/matches/${m.id}/setup`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {m.status === 'SCHEDULED' ? 'Setup' : 'View Setup'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
