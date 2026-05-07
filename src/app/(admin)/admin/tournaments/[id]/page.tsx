'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Users, Trophy, Plus, Trash2, Loader2 } from 'lucide-react';

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [tournamentTeams, setTournamentTeams] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', format: 'T20', type: 'LEAGUE',
    status: 'UPCOMING', startDate: '', endDate: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/tournaments/${id}`).then(r => r.json()),
      fetch('/api/teams').then(r => r.json()),
    ]).then(([tournament, teams]) => {
      if (tournament.error) { setError('Tournament not found'); setLoading(false); return; }
      setForm({
        name: tournament.name,
        format: tournament.format,
        type: tournament.type,
        status: tournament.status,
        startDate: tournament.startDate?.split('T')[0] || '',
        endDate: tournament.endDate?.split('T')[0] || '',
      });
      setTournamentTeams(tournament.tournamentTeams?.map((tt: any) => tt.team) || []);
      setAllTeams(teams);
      setLoading(false);
    }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push('/admin/tournaments');
    } finally { setSaving(false); }
  };

  const addTeam = async (teamId: string) => {
    const res = await fetch(`/api/tournaments/${id}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    if (res.ok) {
      const team = allTeams.find(t => t.id === teamId);
      if (team) setTournamentTeams(prev => [...prev, team]);
    }
  };

  const removeTeam = async (teamId: string) => {
    const res = await fetch(`/api/tournaments/${id}/teams`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    });
    if (res.ok) setTournamentTeams(prev => prev.filter((t: any) => t.id !== teamId));
  };

  const availableTeams = allTeams.filter(t => !tournamentTeams.find((tt: any) => tt.id === t.id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tournaments">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Tournament</h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader><CardTitle>Tournament Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Tournament Name *</Label>
              <Input className="mt-2" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Format</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))}>
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="TEST">Test</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="LEAGUE">League</option>
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" className="mt-2" value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input type="date" className="mt-2" value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Link href="/admin/tournaments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Tournament'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Teams Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teams in Tournament ({tournamentTeams.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current teams */}
          {tournamentTeams.length === 0 ? (
            <p className="text-muted-foreground text-sm">No teams added yet.</p>
          ) : (
            <div className="space-y-2">
              {tournamentTeams.map((team: any) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.color || '#6366f1' }}>
                      {team.name.charAt(0)}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTeam(team.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add team */}
          {availableTeams.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <Label className="text-sm text-muted-foreground mb-2 block">Add Team</Label>
              <div className="flex flex-wrap gap-2">
                {availableTeams.map((team: any) => (
                  <button key={team.id}
                    onClick={() => addTeam(team.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-secondary text-sm transition-colors">
                    <Plus className="w-3 h-3" />
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
