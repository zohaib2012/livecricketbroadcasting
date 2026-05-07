'use client';
import { useEffect, useState } from 'react';
import { User, Plus, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ScorersPage() {
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScorer, setNewScorer] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScorers();
  }, []);

  const fetchScorers = () => {
    fetch('/api/scorers')
      .then(r => r.json())
      .then(data => { setScorers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const createScorer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/scorers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScorer),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setNewScorer({ name: '', email: '', password: '' });
      fetchScorers();
    } finally { setCreating(false); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scorers</h1>
        <p className="text-muted-foreground mt-1">{scorers.length} scorers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5"/>Create Scorer Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createScorer} className="flex gap-4 items-end">
            {error && <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="flex-1"><Label>Name</Label><Input className="mt-2" value={newScorer.name} onChange={e => setNewScorer(p => ({...p, name: e.target.value}))} placeholder="Name" required /></div>
            <div className="flex-1"><Label>Email</Label><Input type="email" className="mt-2" value={newScorer.email} onChange={e => setNewScorer(p => ({...p, email: e.target.value}))} placeholder="Email" required /></div>
            <div className="flex-1"><Label>Password</Label><Input type="password" className="mt-2" value={newScorer.password} onChange={e => setNewScorer(p => ({...p, password: e.target.value}))} placeholder="Password" required /></div>
            <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {scorers.map((s: any) => (
          <Card key={s.id} className="premium-card-hover">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary"/></div>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Created {new Date(s.createdAt).toLocaleDateString()}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
