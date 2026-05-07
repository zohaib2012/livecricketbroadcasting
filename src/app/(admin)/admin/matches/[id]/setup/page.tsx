'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Loader2, Star, Shield } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string;
  battingStyle: string;
}

interface TeamPlayer {
  player: Player;
  jerseyNumber: number | null;
}

export default function MatchSetupPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [team1Players, setTeam1Players] = useState<TeamPlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<TeamPlayer[]>([]);

  // Toss state
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');

  // Playing XI: { playerId, battingOrder, isCaptain, isWicketkeeper }
  const [team1XI, setTeam1XI] = useState<any[]>([]);
  const [team2XI, setTeam2XI] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then(r => r.json())
      .then(async (m) => {
        if (m.error) { setError('Match not found'); setLoading(false); return; }
        setMatch(m);
        setTossWinnerId(m.team1Id);

        // Fetch players for both teams
        const [t1, t2] = await Promise.all([
          fetch(`/api/teams/${m.team1Id}`).then(r => r.json()),
          fetch(`/api/teams/${m.team2Id}`).then(r => r.json()),
        ]);
        setTeam1Players(t1.teamPlayers || []);
        setTeam2Players(t2.teamPlayers || []);

        // Pre-fill from existing playing XI if match already has one
        if (m.playingXI?.length > 0) {
          const t1XI = m.playingXI.filter((p: any) => p.teamId === m.team1Id);
          const t2XI = m.playingXI.filter((p: any) => p.teamId === m.team2Id);
          setTeam1XI(t1XI.map((p: any) => ({ playerId: p.playerId, battingOrder: p.battingOrder, isCaptain: p.isCaptain, isWicketkeeper: p.isWicketkeeper })));
          setTeam2XI(t2XI.map((p: any) => ({ playerId: p.playerId, battingOrder: p.battingOrder, isCaptain: p.isCaptain, isWicketkeeper: p.isWicketkeeper })));
          if (m.tossWinnerId) setTossWinnerId(m.tossWinnerId);
          if (m.tossDecision) setTossDecision(m.tossDecision);
        }
        setLoading(false);
      }).catch(() => { setError('Failed to load match'); setLoading(false); });
  }, [matchId]);

  const togglePlayer = (teamNum: 1 | 2, playerId: string) => {
    const setXI = teamNum === 1 ? setTeam1XI : setTeam2XI;
    const xi = teamNum === 1 ? team1XI : team2XI;
    const exists = xi.find(p => p.playerId === playerId);
    if (exists) {
      setXI(prev => prev.filter(p => p.playerId !== playerId));
    } else {
      if (xi.length >= 11) { setError('Maximum 11 players per team'); return; }
      setXI(prev => [...prev, { playerId, battingOrder: prev.length + 1, isCaptain: false, isWicketkeeper: false }]);
      setError('');
    }
  };

  const toggleCaptain = (teamNum: 1 | 2, playerId: string) => {
    const setXI = teamNum === 1 ? setTeam1XI : setTeam2XI;
    setXI(prev => prev.map(p => ({ ...p, isCaptain: p.playerId === playerId ? !p.isCaptain : false })));
  };

  const toggleWK = (teamNum: 1 | 2, playerId: string) => {
    const setXI = teamNum === 1 ? setTeam1XI : setTeam2XI;
    setXI(prev => prev.map(p => ({ ...p, isWicketkeeper: p.playerId === playerId ? !p.isWicketkeeper : false })));
  };

  const handleSubmit = async () => {
    if (!tossWinnerId) { setError('Select toss winner'); return; }
    if (team1XI.length !== 11) { setError(`${match?.team1?.name} needs exactly 11 players (${team1XI.length}/11)`); return; }
    if (team2XI.length !== 11) { setError(`${match?.team2?.name} needs exactly 11 players (${team2XI.length}/11)`); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/matches/${matchId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tossWinnerId, tossDecision, team1XI, team2XI }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Setup failed'); return; }
      router.push('/admin/matches');
    } finally { setSaving(false); }
  };

  const PlayerGrid = ({ players, xi, teamNum }: { players: TeamPlayer[], xi: any[], teamNum: 1 | 2 }) => (
    <div className="space-y-2">
      {players.map(({ player, jerseyNumber }) => {
        const selected = xi.find(p => p.playerId === player.id);
        return (
          <div key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
              selected
                ? 'bg-accent/10 border-accent/40'
                : 'border-border/30 hover:border-border hover:bg-secondary/30'
            }`}
            onClick={() => togglePlayer(teamNum, player.id)}>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                selected ? 'bg-accent border-accent text-white' : 'border-border/50'
              }`}>
                {selected ? '✓' : jerseyNumber || ''}
              </div>
              <div>
                <span className="font-medium text-sm">{player.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{player.role?.replace('_', ' ')}</span>
              </div>
            </div>
            {selected && (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => toggleCaptain(teamNum, player.id)}
                  className={`p-1 rounded text-xs transition-colors ${selected.isCaptain ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
                  title="Captain">
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleWK(teamNum, player.id)}
                  className={`p-1 rounded text-xs transition-colors ${selected.isWicketkeeper ? 'text-blue-400' : 'text-muted-foreground hover:text-blue-400'}`}
                  title="Wicketkeeper">
                  <Shield className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Match Setup</h1>
          {match && (
            <p className="text-muted-foreground mt-1">
              {match.team1?.name} vs {match.team2?.name}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Toss */}
      <Card>
        <CardHeader><CardTitle>Toss Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Toss Winner</Label>
            <div className="grid grid-cols-2 gap-3">
              {[match?.team1, match?.team2].map((team: any) => team && (
                <button key={team.id}
                  onClick={() => setTossWinnerId(team.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    tossWinnerId === team.id ? 'border-accent bg-accent/10' : 'border-border/50 hover:border-border'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: team.color || '#6366f1' }}>
                      {team.name?.charAt(0)}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Elected to</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['BAT', 'BOWL'] as const).map(d => (
                <button key={d}
                  onClick={() => setTossDecision(d)}
                  className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${
                    tossDecision === d ? 'border-accent bg-accent/10 text-accent' : 'border-border/50 hover:border-border'
                  }`}>
                  {d === 'BAT' ? '🏏 Bat First' : '🎯 Bowl First'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playing XI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{match?.team1?.name}</span>
              <Badge variant={team1XI.length === 11 ? 'success' : 'secondary'}>
                {team1XI.length}/11
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click to select. ★ = Captain, 🛡 = WK</p>
          </CardHeader>
          <CardContent>
            {team1Players.length === 0 ? (
              <p className="text-muted-foreground text-sm">No players in this team. <Link href="/admin/players/create" className="text-accent underline">Add players first.</Link></p>
            ) : (
              <PlayerGrid players={team1Players} xi={team1XI} teamNum={1} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{match?.team2?.name}</span>
              <Badge variant={team2XI.length === 11 ? 'success' : 'secondary'}>
                {team2XI.length}/11
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click to select. ★ = Captain, 🛡 = WK</p>
          </CardHeader>
          <CardContent>
            {team2Players.length === 0 ? (
              <p className="text-muted-foreground text-sm">No players in this team. <Link href="/admin/players/create" className="text-accent underline">Add players first.</Link></p>
            ) : (
              <PlayerGrid players={team2Players} xi={team2XI} teamNum={2} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/admin/matches">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={saving} className="min-w-[160px]">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</> : '🏏 Save & Start Match'}
        </Button>
      </div>
    </div>
  );
}
