'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Undo2, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { emitOverlayDisplay, emitOverlayAnimate, emitOverlayDecision } from '@/lib/socket';

export default function ScoringPage({ params }: { params: { matchId: string } }) {
  const [matchData, setMatchData] = useState<any>(null);
  const [currentInnings, setCurrentInnings] = useState<any>(null);
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [bowlerId, setBowlerId] = useState<string>('');
  const [thisOver, setThisOver] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWicketDialog, setShowWicketDialog] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [showStrikerSelect, setShowStrikerSelect] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState('DEFAULT');

  useEffect(() => {
    loadData();
  }, [params.matchId]);

  const loadData = async () => {
    try {
      const [matchRes, liveRes] = await Promise.all([
        fetch(`/api/matches/${params.matchId}`),
        fetch(`/api/matches/${params.matchId}/live`),
      ]);
      const match = await matchRes.json();
      const live = await liveRes.json();
      setMatchData(match);

      if (live.currentInnings) {
        setCurrentInnings(live.currentInnings);
        const notOutBatsmen = live.currentInnings.battingScorecards?.filter((bs: any) => !bs.howOut) || [];
        if (notOutBatsmen.length >= 1) setStrikerId(notOutBatsmen[0].playerId);
        if (notOutBatsmen.length >= 2) setNonStrikerId(notOutBatsmen[1].playerId);
        const currentBowler = live.currentInnings.bowlingScorecards?.[0];
        if (currentBowler) setBowlerId(currentBowler.playerId);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };


  const getBowlerName = () => {
    const bowlingTeam = matchData?.team1?.id === currentInnings?.bowlingTeamId
      ? matchData?.team1
      : matchData?.team2;
    const allPlayers = bowlingTeam?.teamPlayers?.map((tp: any) => tp.player) || [];
    return allPlayers.find((p: any) => p.id === bowlerId)?.name || 'Select Bowler';
  };

  const scoreBall = async (runs: number, extras: string | null = null, isWicket: boolean = false, wType?: string) => {
    if (!currentInnings || !strikerId || !bowlerId) {
      setError('Please select striker and bowler first');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/scoring/ball', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: params.matchId,
          inningsId: currentInnings.id,
          batsmanId: strikerId,
          nonStrikerId,
          bowlerId,
          runs,
          extras,
          isWicket,
          wicketType: wType || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const data = await res.json();

      // Update innings immediately from response - no extra DB round-trip
      if (data.liveData?.currentInnings) {
        setCurrentInnings(data.liveData.currentInnings);
      }

      // Swap striker/non-striker on odd runs
      if (!extras && (runs === 1 || runs === 3)) {
        const temp = strikerId;
        setStrikerId(nonStrikerId);
        setNonStrikerId(temp);
      }

      // Reset over display after 6 legal balls
      setThisOver(prev => {
        const legalCount = prev.filter((b: any) => !b.isWide && !b.isNoBall).length;
        if (legalCount >= 6) return [data.ball];
        return [...prev, data.ball];
      });

      // Show striker select after wicket so scorer picks next batsman
      if (isWicket) setShowStrikerSelect(true);

      // Background sync - does NOT block buttons
      loadData();
    } catch {
      setError('Failed to score ball');
    } finally {
      setSubmitting(false);
    }
  };

  const undoBall = async () => {
    try {
      await fetch('/api/scoring/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inningsId: currentInnings.id }),
      });
      setThisOver(prev => prev.slice(0, -1));
      loadData(); // background - no await
    } catch { setError('Failed to undo'); }
  };

  const endInnings = async () => {
    if (!confirm('End this innings?')) return;
    try {
      const res = await fetch('/api/scoring/end-innings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: params.matchId, inningsId: currentInnings.id }),
      });
      const data = await res.json();
      alert(`Innings ended. Target: ${data.target}`);
      await loadData();
    } catch { setError('Failed to end innings'); }
  };

  const endMatch = async () => {
    if (!confirm('End this match?')) return;
    try {
      const res = await fetch('/api/scoring/end-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: params.matchId, inningsId: currentInnings.id }),
      });
      const data = await res.json();
      alert(`Match ended: ${data.result}`);
      await loadData();
    } catch { setError('Failed to end match'); }
  };

  const confirmWicket = () => {
    scoreBall(0, null, true, wicketType);
    setShowWicketDialog(false);
    setWicketType('');
  };

  const bowlingTeam = matchData?.team1?.id === currentInnings?.bowlingTeamId
    ? matchData?.team1
    : matchData?.team2;
  const battingTeam = matchData?.team1?.id === currentInnings?.battingTeamId
    ? matchData?.team1
    : matchData?.team2;

  const bowlingTeamPlayers = bowlingTeam?.teamPlayers?.map((tp: any) => tp.player) || [];
  const battingTeamPlayers = battingTeam?.teamPlayers?.map((tp: any) => tp.player) || [];
  const notOutBatsmen = currentInnings?.battingScorecards?.filter((bs: any) => !bs.howOut) || [];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading match data...</div>;
  if (!matchData) return <div className="p-8 text-center text-red-400">Match not found</div>;

  const totalBalls = currentInnings?.totalBalls || 0;
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  const runRate = totalBalls === 0 ? '0.00' : ((currentInnings?.totalRuns || 0) / (totalBalls / 6)).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 glass-effect border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/scorer/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="font-bold">{matchData.team1?.name?.split(' ').map((w:string) => w[0]).join('')} vs {matchData.team2?.name?.split(' ').map((w:string) => w[0]).join('')}</h1>
              <p className="text-sm text-muted-foreground">{matchData.tournament?.name || 'Friendly'} • {matchData.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={matchData.status === 'LIVE' ? 'live' : 'secondary'}>{matchData.status}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: currentInnings?.battingTeam?.color || '#6366f1' }}>
                {currentInnings?.battingTeam?.name?.split(' ').map((w:string) => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="font-semibold">{currentInnings?.battingTeam?.name || 'Batting Team'}</h2>
                <p className="text-sm text-muted-foreground">Innings {currentInnings?.inningsNumber || 1}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {currentInnings?.totalRuns || 0}/{currentInnings?.wickets || 0}
              </div>
              <div className="text-lg text-muted-foreground">({overs}.{balls} ov) • CRR: {runRate}</div>
            </div>
          </div>

          {currentInnings?.target && (
            <div className="mb-4 p-2 rounded-lg bg-accent/10 text-center text-sm">
              Target: <span className="font-bold">{currentInnings.target}</span> | Need: {currentInnings.target - (currentInnings.totalRuns || 0)} from {120 - totalBalls} balls
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
                thisOver[i]
                  ? thisOver[i].isWicket ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : thisOver[i].runs === 6 ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : thisOver[i].runs === 4 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-secondary text-foreground'
                  : 'bg-secondary/30 border border-dashed border-border'
              )}>
                {thisOver[i] ? thisOver[i].isWicket ? 'W' : thisOver[i].isWide ? `${thisOver[i].runs + 1}wd` : thisOver[i].runs.toString() : i + 1}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {currentInnings?.battingScorecards?.filter((bs: any) => !bs.howOut).map((bs: any) => (
              <div key={bs.playerId} className={cn('flex items-center justify-between p-3 rounded-lg transition-colors',
                bs.playerId === strikerId ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/20'
              )}>
                <div className="flex items-center gap-3">
                  {bs.playerId === strikerId && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                  <span className="font-medium">{bs.player?.name}{bs.playerId === strikerId ? ' *' : ''}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-lg">{bs.runs}</span>
                  <span className="text-muted-foreground">({bs.balls})</span>
                  <span className="text-muted-foreground">SR: {bs.strikeRate?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">{getBowlerName()}</span>
              {currentInnings?.bowlingScorecards?.[0] && (
                <div className="flex items-center gap-4 text-sm">
                  <span>O: {currentInnings.bowlingScorecards[0].overs}</span>
                  <span>R: {currentInnings.bowlingScorecards[0].runs}</span>
                  <span className="font-bold text-red-400">W: {currentInnings.bowlingScorecards[0].wickets}</span>
                  <span>Econ: {currentInnings.bowlingScorecards[0].economy?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-4">Score Runs</h3>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(runs => (
              <Button key={runs} variant="outline" size="lg" onClick={() => scoreBall(runs)} disabled={submitting} className="text-xl font-bold">{runs}</Button>
            ))}
            <Button variant="outline" size="lg" onClick={() => scoreBall(4)} disabled={submitting} className="text-xl font-bold bg-blue-500/10 border-blue-500/30 text-blue-400">4</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(5)} disabled={submitting} className="text-xl font-bold">5</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(6)} disabled={submitting} className="text-xl font-bold bg-green-500/10 border-green-500/30 text-green-400">6</Button>
            <Button variant="outline" size="lg" onClick={() => setShowWicketDialog(true)} disabled={submitting} className="text-xl font-bold bg-red-500/10 border-red-500/30 text-red-400">W</Button>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-4">Extras</h3>
          <div className="grid grid-cols-4 gap-3">
            <Button variant="outline" size="lg" onClick={() => scoreBall(0, 'wide')} disabled={submitting} className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400">Wide</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(0, 'noball')} disabled={submitting} className="bg-orange-500/10 border-orange-500/30 text-orange-400">No Ball</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(1, 'bye')} disabled={submitting}>Bye</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(1, 'legbye')} disabled={submitting}>Leg Bye</Button>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold mb-3">📡 Display Controller</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { mode: 'DEFAULT', label: 'Default' },
              { mode: 'BATTING', label: 'Batting' },
              { mode: 'BOWLING', label: 'Bowling' },
              { mode: 'FOW', label: 'FoW' },
              { mode: 'SUMMARY', label: 'Summary' },
              { mode: 'TARGET', label: 'Target' },
              { mode: 'PARTNERSHIP', label: 'Partner' },
            ].map(({ mode, label }) => (
              <Button
                key={mode}
                variant={activeDisplay === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveDisplay(mode);
                  emitOverlayDisplay(params.matchId, mode);
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-3">🎬 Animations</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { type: 'FOUR', label: '🟡 FOUR', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
              { type: 'SIX', label: '🟣 SIX', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
              { type: 'WICKET', label: '🔴 WICKET', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
              { type: 'FREE_HIT', label: '✨ FREE HIT', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
              { type: 'HAT_TRICK', label: '🏆 HAT-TRICK', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
              { type: 'STOP', label: '⛔ STOP', color: '' },
            ].map(({ type, label, color }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={color}
                onClick={() => emitOverlayAnimate(params.matchId, type === 'STOP' ? '' : type)}
              >
                {label}
              </Button>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-3">⚖️ DRS / Decision</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { decision: 'REVIEW', label: '⏳ Under Review', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
              { decision: 'OUT', label: '❌ OUT', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
              { decision: 'NOT_OUT', label: '✅ NOT OUT', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
            ].map(({ decision, label, color }) => (
              <Button
                key={decision}
                variant="outline"
                className={color}
                onClick={() => emitOverlayDecision(params.matchId, decision)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={undoBall} disabled={submitting}>
              <Undo2 className="w-4 h-4 mr-2" />Undo
            </Button>
            <Button variant="outline" onClick={() => setShowBowlerSelect(true)} disabled={submitting}>
              <Users className="w-4 h-4 mr-2" />Change Bowler
            </Button>
            <Button variant="outline" onClick={() => setShowStrikerSelect(true)} disabled={submitting}>
              <Users className="w-4 h-4 mr-2" />Change Striker
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={endInnings} disabled={submitting}>End Innings</Button>
            <Button variant="outline" onClick={endMatch} disabled={submitting}>End Match</Button>
          </div>
        </div>
      </div>

      {showWicketDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="premium-card p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Wicket!</h3>
            <p className="text-muted-foreground mb-4">Select dismissal type</p>
            <div className="grid grid-cols-2 gap-2">
              {['BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET'].map(type => (
                <Button key={type} variant={wicketType === type ? 'default' : 'outline'} onClick={() => setWicketType(type)} className="py-4">
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => { setShowWicketDialog(false); setWicketType(''); }}>Cancel</Button>
              <Button className="flex-1" onClick={confirmWicket} disabled={!wicketType}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {showBowlerSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="premium-card p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Select Bowler</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bowlingTeamPlayers.map((p: any) => (
                <Button key={p.id} variant={bowlerId === p.id ? 'default' : 'outline'} className="w-full justify-start" onClick={() => { setBowlerId(p.id); setShowBowlerSelect(false); }}>
                  {p.name} - {p.role}
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowBowlerSelect(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {showStrikerSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="premium-card p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2">New Batsman</h3>
            <p className="text-muted-foreground text-sm mb-4">Wicket giri — agle batsman ko select karo</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {battingTeamPlayers
                .filter((p: any) => p.id !== nonStrikerId && !notOutBatsmen.find((bs: any) => bs.playerId === p.id && !bs.howOut))
                .map((p: any) => (
                  <Button key={p.id} variant="outline" className="w-full justify-start" onClick={() => { setStrikerId(p.id); setShowStrikerSelect(false); }}>
                    {p.name} - {p.role}
                  </Button>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowStrikerSelect(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
