'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-rounder',
  WICKET_KEEPER: 'Wicket Keeper',
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground mt-1">{players.length} players total</p>
        </div>
        <Link href="/admin/players/create">
          <Button><Plus className="w-4 h-4 mr-2" />Add Player</Button>
        </Link>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No players yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {players.map((p: any) => (
            <Card key={p.id} className="premium-card-hover">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline">{roleLabels[p.role] || p.role}</Badge>
                      <span>{p.battingStyle}</span>
                      {p.bowlingStyle && <span>• {p.bowlingStyle}</span>}
                    </div>
                  </div>
                </div>
                <Link href={`/admin/players/${p.id}`}>
                  <Button variant="outline" size="sm"><Edit className="w-4 h-4"/></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
