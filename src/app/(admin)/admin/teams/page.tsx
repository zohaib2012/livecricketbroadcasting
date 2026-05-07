'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then(data => { setTeams(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const deleteTeam = async (id: string) => {
    if (!confirm('Delete this team?')) return;
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">{teams.length} teams total</p>
        </div>
        <Link href="/admin/teams/create">
          <Button><Plus className="w-4 h-4 mr-2" />Add Team</Button>
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No teams yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <Card key={team.id} className="premium-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: team.color || '#6366f1' }}>
                    {team.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team._count?.teamPlayers || 0} players</p>
                  </div>
                </div>
                {team.homeGround && <p className="text-sm text-muted-foreground mb-4">{team.homeGround}</p>}
                <div className="flex gap-2">
                  <Link href={`/admin/teams/${team.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Edit className="w-4 h-4 mr-1"/>Edit</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => deleteTeam(team.id)}>
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
