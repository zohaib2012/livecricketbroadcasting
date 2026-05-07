'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [form, setForm] = useState({
    team1Id: '', team2Id: '', tournamentId: '',
    scheduledAt: '', venueId: '', scorerId: '',
  });

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(setTeams).catch(() => {});
    fetch('/api/tournaments').then(r => r.json()).then(setTournaments).catch(() => {});
    fetch('/api/scorers').then(r => r.json()).then(setScorers).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push('/admin/matches');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Match</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Match Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Team 1 *</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.team1Id} onChange={e => setForm(p => ({...p, team1Id: e.target.value}))} required>
                  <option value="">Select team 1</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div><Label>Team 2 *</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.team2Id} onChange={e => setForm(p => ({...p, team2Id: e.target.value}))} required>
                  <option value="">Select team 2</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Tournament (optional)</Label>
              <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.tournamentId} onChange={e => setForm(p => ({...p, tournamentId: e.target.value}))}>
                <option value="">No tournament</option>
                {tournaments.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div><Label>Scheduled Date/Time *</Label>
              <Input type="datetime-local" className="mt-2" value={form.scheduledAt} onChange={e => setForm(p => ({...p, scheduledAt: e.target.value}))} required />
            </div>
            <div><Label>Assign Scorer (optional)</Label>
              <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.scorerId} onChange={e => setForm(p => ({...p, scorerId: e.target.value}))}>
                <option value="">Unassigned</option>
                {scorers.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Match'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
