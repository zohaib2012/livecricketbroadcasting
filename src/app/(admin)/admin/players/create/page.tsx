'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreatePlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', role: 'BATSMAN', battingStyle: 'RIGHT_HANDED',
    bowlingStyle: '', dateOfBirth: '', teamId: '', jerseyNumber: '',
  });

  useEffect(() => {
    fetch('/api/teams').then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bowlingStyle: form.bowlingStyle || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push('/admin/players');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Player</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Player Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div><Label>Player Name *</Label>
              <Input className="mt-2" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Virat Kohli" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Role</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                  <option value="BATSMAN">Batsman</option><option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-rounder</option><option value="WICKET_KEEPER">Wicket Keeper</option>
                </select>
              </div>
              <div><Label>Batting Style</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.battingStyle} onChange={e => setForm(p => ({...p, battingStyle: e.target.value}))}>
                  <option value="RIGHT_HANDED">Right Handed</option><option value="LEFT_HANDED">Left Handed</option>
                </select>
              </div>
            </div>
            <div><Label>Bowling Style</Label>
              <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.bowlingStyle} onChange={e => setForm(p => ({...p, bowlingStyle: e.target.value}))}>
                <option value="">None</option>
                <option value="RIGHT_ARM_FAST">Right-arm fast</option>
                <option value="RIGHT_ARM_MEDIUM">Right-arm medium</option>
                <option value="RIGHT_ARM_OFF_SPIN">Right-arm off-spin</option>
                <option value="RIGHT_ARM_LEG_SPIN">Right-arm leg-spin</option>
                <option value="LEFT_ARM_FAST">Left-arm fast</option>
                <option value="LEFT_ARM_MEDIUM">Left-arm medium</option>
                <option value="LEFT_ARM_ORTHODOX">Left-arm orthodox</option>
                <option value="LEFT_ARM_CHINAMAN">Left-arm chinaman</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date of Birth</Label>
                <Input type="date" className="mt-2" value={form.dateOfBirth} onChange={e => setForm(p => ({...p, dateOfBirth: e.target.value}))} />
              </div>
              <div><Label>Team</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.teamId} onChange={e => setForm(p => ({...p, teamId: e.target.value}))}>
                  <option value="">Select team (optional)</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Jersey Number</Label>
              <Input type="number" className="mt-2" value={form.jerseyNumber} onChange={e => setForm(p => ({...p, jerseyNumber: e.target.value}))} placeholder="e.g. 18" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Player'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
