'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', format: 'T20', type: 'LEAGUE',
    startDate: '', endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const t = await res.json();
      router.push(`/admin/tournaments/${t.id}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tournaments">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Tournament</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Tournament Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <div><Label>Tournament Name *</Label>
              <Input className="mt-2" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Kutch T20 2025" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Format</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.format} onChange={e => setForm(p => ({...p, format: e.target.value}))}>
                  <option value="T20">T20</option><option value="ODI">ODI</option>
                  <option value="TEST">Test</option><option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div><Label>Type</Label>
                <select className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                  <option value="LEAGUE">League</option><option value="KNOCKOUT">Knockout</option><option value="MIXED">Mixed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date *</Label>
                <Input type="date" className="mt-2" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} required/>
              </div>
              <div><Label>End Date *</Label>
                <Input type="date" className="mt-2" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} required/>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
