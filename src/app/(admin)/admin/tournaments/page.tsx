'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then(data => { setTournaments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deleteTournament = async (id: string) => {
    if (!confirm('Delete this tournament?')) return;
    await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
    setTournaments(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground mt-1">{tournaments.length} tournaments total</p>
        </div>
        <Link href="/admin/tournaments/create">
          <Button><Plus className="w-4 h-4 mr-2" />New Tournament</Button>
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No tournaments yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t: any) => (
            <Card key={t.id} className="premium-card-hover">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{t.format}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{t._count?.tournamentTeams || 0} Teams</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(t.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={t.status === 'ONGOING' ? 'live' : t.status === 'COMPLETED' ? 'success' : 'secondary'}>
                    {t.status}
                  </Badge>
                  <Link href={`/admin/tournaments/${t.id}`}>
                    <Button variant="outline" size="sm"><Edit className="w-4 h-4"/></Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => deleteTournament(t.id)}>
                    <Trash2 className="w-4 h-4 text-red-400"/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
