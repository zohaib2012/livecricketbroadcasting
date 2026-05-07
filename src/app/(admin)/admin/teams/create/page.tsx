'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', color: '#6366f1', homeGround: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push('/admin/teams');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teams">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Team</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Team Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div><Label>Team Name *</Label>
              <Input className="mt-2" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Mumbai Indians" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input type="color" value={form.color} onChange={e => setForm(p => ({...p, color: e.target.value}))} className="w-16 h-10" />
                  <Input value={form.color} onChange={e => setForm(p => ({...p, color: e.target.value}))} />
                </div>
              </div>
              <div><Label>Home Ground</Label>
                <Input className="mt-2" value={form.homeGround} onChange={e => setForm(p => ({...p, homeGround: e.target.value}))} placeholder="e.g. Wankhede Stadium" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
