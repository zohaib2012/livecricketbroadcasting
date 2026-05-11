'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Undo2, Users, ArrowLeftRight, UserX, Send, Trophy, UserPlus } from 'lucide-react';
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
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState('DEFAULT');
  const [customDisplayText, setCustomDisplayText] = useState('');
  const [momPlayerId, setMomPlayerId] = useState('');
  const [addBattingNames, setAddBattingNames] = useState('');
  const [addBowlingNames, setAddBowlingNames] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [showPlayerSection, setShowPlayerSection] = useState(false);

  useEffect(() => { loadData(); }, [params.matchId]);

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
        const notOut = live.currentInnings.battingScorecards?.filter((bs: any) => !bs.howOut) || [];
        if (notOut.length >= 1) setStrikerId(notOut[0].playerId);
        if (notOut.length >= 2) setNonStrikerId(notOut[1].playerId);
        const bowler = live.currentInnings.bowlingScorecards?.[0];
        if (bowler) setBowlerId(bowler.playerId);
      }
      setLoading(false);
    } catch { setLoading(false); }
  };

  const getBowlerName = () => {
    const bowlingTeam = matchData?.team1?.id === currentInnings?.bowlingTeamId ? matchData?.team1 : matchData?.team2;
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
      if (data.liveData?.currentInnings) setCurrentInnings(data.liveData.currentInnings);
      if (!extras && (runs === 1 || runs === 3)) {
        const temp = strikerId; setStrikerId(nonStrikerId); setNonStrikerId(temp);
      }
      setThisOver(prev => {
        const legalCount = prev.filter((b: any) => !b.isWide && !b.isNoBall).length;
        if (legalCount >= 6) return [data.ball];
        return [...prev, data.ball];
      });
      if (isWicket) setShowStrikerSelect(true);
      loadData();
    } catch { setError('Failed to score ball'); }
    finally { setSubmitting(false); }
  };

  const undoBall = async () => {
    try {
      await fetch('/api/scoring/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inningsId: currentInnings.id }),
      });
      setThisOver(prev => prev.slice(0, -1));
      loadData();
    } catch { setError('Failed to undo'); }
  };

  const swapBatter = () => {
    const temp = strikerId;
    setStrikerId(nonStrikerId);
    setNonStrikerId(temp);
  };

  const retireBatter = async () => {
    if (!strikerId || !currentInnings) return;
    try {
      await fetch('/api/scoring/retire-batter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inningsId: currentInnings.id, playerId: strikerId, matchId: params.matchId }),
      });
      setShowRetireDialog(false);
      setShowStrikerSelect(true);
      loadData();
    } catch { setError('Failed to retire batter'); }
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

  const sendOverlayDisplay = (mode: string) => {
    setActiveDisplay(mode);
    emitOverlayDisplay(params.matchId, mode);
  };

  const displayCustomInput = async () => {
    if (!customDisplayText.trim()) return;
    await fetch('/api/overlay/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: params.matchId, event: 'overlay_custom', data: { text: customDisplayText } }),
    });
  };

  const displayMOM = async () => {
    const allPlayers = [...battingTeamPlayers, ...bowlingTeamPlayers];
    const player = allPlayers.find((p: any) => p.id === momPlayerId);
    if (!player) return;
    await fetch('/api/overlay/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: params.matchId, event: 'overlay_mom', data: { player: player.name } }),
    });
  };

  const addPlayers = async (teamId: string, names: string, isBatting: boolean) => {
    if (!names.trim() || !teamId) return;
    setAddingPlayer(true);
    const nameList = names.split(',').map(n => n.trim()).filter(Boolean);
    try {
      for (const name of nameList) {
        await fetch('/api/scoring/add-player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, name }),
        });
      }
      if (isBatting) setAddBattingNames(''); else setAddBowlingNames('');
      loadData();
    } catch { setError('Failed to add player'); }
    setAddingPlayer(false);
  };

  const bowlingTeam = matchData?.team1?.id === currentInnings?.bowlingTeamId ? matchData?.team1 : matchData?.team2;
  const battingTeam = matchData?.team1?.id === currentInnings?.battingTeamId ? matchData?.team1 : matchData?.team2;
  const bowlingTeamPlayers = bowlingTeam?.teamPlayers?.map((tp: any) => tp.player) || [];
  const battingTeamPlayers = battingTeam?.teamPlayers?.map((tp: any) => tp.player) || [];
  const notOutBatsmen = currentInnings?.battingScorecards?.filter((bs: any) => !bs.howOut) || [];
  const allPlayers = [...battingTeamPlayers, ...bowlingTeamPlayers];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading match data...</div>;
  if (!matchData) return <div className="p-8 text-center text-red-400">Match not found</div>;

  const totalBalls = currentInnings?.totalBalls || 0;
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  const runRate = totalBalls === 0 ? '0.00' : ((currentInnings?.totalRuns || 0) / (totalBalls / 6)).toFixed(2);
  const target = currentInnings?.target;
  const runsNeeded = target ? target - (currentInnings?.totalRuns || 0) : null;
  const ballsLeft = target ? (matchData?.overs || 20) * 6 - totalBalls : null;
  const rrr = (runsNeeded && ballsLeft && ballsLeft > 0) ? (runsNeeded / (ballsLeft / 6)).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-effect border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/scorer/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="font-bold text-sm">
                {matchData.team1?.name?.split(' ').map((w: string) => w[0]).join('')} vs {matchData.team2?.name?.split(' ').map((w: string) => w[0]).join('')}
              </h1>
              <p className="text-xs text-muted-foreground">{matchData.tournament?.name || 'Friendly'}</p>
            </div>
          </div>
          <Badge variant={matchData.status === 'LIVE' ? 'live' : 'secondary'}>{matchData.status}</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 space-y-3">
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {/* Scoreboard */}
        <div className="premium-card p-4">
          {/* CRR / RRR row */}
          <div className="flex gap-3 mb-3 text-sm font-semibold">
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300">CRR: {runRate}</span>
            {rrr && <span className="px-3 py-1 rounded bg-orange-500/20 text-orange-300">RRR: {rrr}</span>}
          </div>

          {/* Target bar */}
          {target && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center text-sm font-bold text-red-300">
              TARGET — {target} &nbsp;|&nbsp; NEED <span className="text-yellow-300">{runsNeeded}</span> RUNS FROM <span className="text-yellow-300">{ballsLeft}</span> BALLS
            </div>
          )}

          {/* Score */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: currentInnings?.battingTeam?.color || '#6366f1' }}>
                {currentInnings?.battingTeam?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'BT'}
              </div>
              <div>
                <p className="font-semibold text-sm">{currentInnings?.battingTeam?.name || 'Batting'}</p>
                <p className="text-xs text-muted-foreground">Innings {currentInnings?.inningsNumber || 1}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {currentInnings?.totalRuns || 0}/{currentInnings?.wickets || 0}
              </div>
              <div className="text-sm text-muted-foreground">{overs}.{balls} overs</div>
            </div>
          </div>

          {/* Over balls */}
          <div className="flex gap-2 mb-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                thisOver[i]
                  ? thisOver[i].isWicket ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : thisOver[i].runs === 6 ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : thisOver[i].runs === 4 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-secondary text-foreground'
                  : 'bg-secondary/30 border border-dashed border-border'
              )}>
                {thisOver[i] ? thisOver[i].isWicket ? 'W' : thisOver[i].isWide ? `${thisOver[i].runs + 1}wd` : thisOver[i].runs.toString() : '·'}
              </div>
            ))}
          </div>

          {/* Batsmen */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { id: strikerId, isStriker: true },
              { id: nonStrikerId, isStriker: false },
            ].map(({ id, isStriker }) => {
              const bs = currentInnings?.battingScorecards?.find((b: any) => b.playerId === id);
              const name = [...battingTeamPlayers, ...bowlingTeamPlayers].find((p: any) => p.id === id)?.name || (isStriker ? 'Striker' : 'Non-striker');
              return (
                <div key={id || String(isStriker)} className={cn('flex items-center justify-between p-2 rounded-lg text-sm',
                  isStriker ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/20')}>
                  <div className="flex items-center gap-2">
                    {isStriker && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                    <span className="font-medium truncate max-w-[80px]">{name}{isStriker ? ' *' : ''}</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-base">{bs?.runs ?? 0}</span>
                    <span className="text-muted-foreground ml-1">({bs?.balls ?? 0})</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bowler */}
          <div className="p-2 rounded-lg bg-secondary/20 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">🎳 {getBowlerName()}</span>
              {currentInnings?.bowlingScorecards?.[0] && (
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{currentInnings.bowlingScorecards[0].overs}ov</span>
                  <span>{currentInnings.bowlingScorecards[0].runs}r</span>
                  <span className="text-red-400 font-bold">{currentInnings.bowlingScorecards[0].wickets}w</span>
                  <span>Eco:{currentInnings.bowlingScorecards[0].economy?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controller Buttons */}
        <div className="premium-card p-4">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white font-bold" onClick={swapBatter} disabled={submitting}>
              <ArrowLeftRight className="w-3 h-3 mr-1" />SWAP BATTER
            </Button>
            <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10" onClick={() => setShowRetireDialog(true)} disabled={submitting}>
              <UserX className="w-3 h-3 mr-1" />RETIRE BATTER
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowBowlerSelect(true)} disabled={submitting}>
              <Users className="w-3 h-3 mr-1" />CHANGE BOWLER
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowStrikerSelect(true)} disabled={submitting}>
              <Users className="w-3 h-3 mr-1" />CHANGE STRIKER
            </Button>
            <Button size="sm" variant="outline" onClick={undoBall} disabled={submitting}>
              <Undo2 className="w-3 h-3 mr-1" />UNDO
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowPlayerSection(v => !v)}>
              <UserPlus className="w-3 h-3 mr-1" />ADD PLAYER
            </Button>
          </div>
        </div>

        {/* Extras checkboxes style + Run Buttons */}
        <div className="premium-card p-4">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => scoreBall(0, 'wide')} disabled={submitting} className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold">Wide</Button>
            <Button variant="outline" size="sm" onClick={() => scoreBall(0, 'noball')} disabled={submitting} className="bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold">No Ball</Button>
            <Button variant="outline" size="sm" onClick={() => scoreBall(1, 'bye')} disabled={submitting} className="font-bold">Byes</Button>
            <Button variant="outline" size="sm" onClick={() => scoreBall(1, 'legbye')} disabled={submitting} className="font-bold">Leg Byes</Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(r => (
              <Button key={r} variant="outline" size="lg" onClick={() => scoreBall(r)} disabled={submitting}
                className="text-2xl font-black h-14">{r}</Button>
            ))}
            <Button variant="outline" size="lg" onClick={() => scoreBall(4)} disabled={submitting}
              className="text-2xl font-black h-14 bg-blue-500/10 border-blue-500/30 text-blue-400">4</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(5)} disabled={submitting}
              className="text-2xl font-black h-14">5</Button>
            <Button variant="outline" size="lg" onClick={() => scoreBall(6)} disabled={submitting}
              className="text-2xl font-black h-14 bg-green-500/10 border-green-500/30 text-green-400">6</Button>
            <Button variant="outline" size="lg" onClick={() => setShowWicketDialog(true)} disabled={submitting}
              className="text-2xl font-black h-14 bg-red-500/10 border-red-500/30 text-red-400">W</Button>
          </div>
        </div>

        {/* Inline Player Add */}
        {showPlayerSection && (
          <div className="premium-card p-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Add Players (comma separated for bulk)</p>
            <div className="flex gap-2">
              <input
                value={addBattingNames}
                onChange={e => setAddBattingNames(e.target.value)}
                placeholder={`ADD PLAYER TO ${battingTeam?.name?.split(' ')[0] || 'BATTING TEAM'}`}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
              />
              <Button size="sm" disabled={addingPlayer} onClick={() => addPlayers(battingTeam?.id, addBattingNames, true)}
                className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => {}}>
                {battingTeam?.name?.split(' ')[0]} ({battingTeamPlayers.length})
              </Button>
            </div>
            <div className="flex gap-2">
              <input
                value={addBowlingNames}
                onChange={e => setAddBowlingNames(e.target.value)}
                placeholder={`ADD PLAYER TO ${bowlingTeam?.name?.split(' ')[0] || 'BOWLING TEAM'}`}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
              />
              <Button size="sm" disabled={addingPlayer} onClick={() => addPlayers(bowlingTeam?.id, addBowlingNames, false)}
                className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => {}}>
                {bowlingTeam?.name?.split(' ')[0]} ({bowlingTeamPlayers.length})
              </Button>
            </div>
          </div>
        )}

        {/* Animations */}
        <div className="premium-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Animations</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'FREE_HIT', label: 'FREE HIT', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
              { type: 'HAT_TRICK', label: 'HAT-TRICK BALL', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
              { type: 'FOUR', label: 'FOUR', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
              { type: 'SIX', label: 'SIX', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
              { type: 'WICKET', label: 'WICKET', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
              { type: 'OVR_BOUNDARIES', label: 'OVR BOUNDARIES', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
              { type: 'TON', label: 'TON / 50', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
              { type: '', label: '⛔ STOP', color: '' },
            ].map(({ type, label, color }) => (
              <Button key={type || 'stop'} variant="outline" size="sm" className={cn('text-xs font-bold', color)}
                onClick={() => emitOverlayAnimate(params.matchId, type)}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Display Controller */}
        <div className="premium-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Display Controller</h3>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { mode: 'DEFAULT', label: 'DEFAULT' },
              { mode: 'BATTING', label: '1BAT' },
              { mode: 'BOWLING', label: '1BALL' },
              { mode: 'FOW', label: '1FEAT' },
              { mode: 'SUMMARY', label: 'SUMMARY' },
              { mode: 'TARGET', label: 'TON' },
              { mode: 'B1', label: 'B1' },
              { mode: 'B2', label: 'B2' },
              { mode: 'BOWLER', label: 'BOWLER' },
              { mode: 'PARTNERSHIP', label: 'PARTNERSHIP' },
              { mode: 'PERFORMANCE', label: 'PERFORMANCE' },
              { mode: 'THANKS', label: 'THANKS PLAYING' },
            ].map(({ mode, label }) => (
              <Button key={mode} size="sm" variant={activeDisplay === mode ? 'default' : 'outline'}
                className="text-xs font-bold"
                onClick={() => sendOverlayDisplay(mode)}>
                {label}
              </Button>
            ))}
          </div>

          {/* Decision */}
          <h3 className="text-sm font-semibold mb-2 mt-3 text-muted-foreground uppercase tracking-wide">Decision</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { decision: 'REVIEW', label: 'PENDING', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
              { decision: 'OUT', label: 'OUT', color: 'bg-red-500/10 border-red-500/30 text-red-400' },
              { decision: 'NOT_OUT', label: 'NOT OUT', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
            ].map(({ decision, label, color }) => (
              <Button key={decision} variant="outline" className={cn('font-bold', color)}
                onClick={() => emitOverlayDecision(params.matchId, decision)}>
                {label}
              </Button>
            ))}
          </div>

          {/* Custom Input */}
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Custom Input</h3>
          <div className="flex gap-2 mb-3">
            <input
              value={customDisplayText}
              onChange={e => setCustomDisplayText(e.target.value)}
              placeholder="Custom input (use | for split text to next line)"
              className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
            />
            <Button size="sm" onClick={displayCustomInput} disabled={!customDisplayText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* MOM */}
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Select MOM Player</h3>
          <div className="flex gap-2">
            <select
              value={momPlayerId}
              onChange={e => setMomPlayerId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
            >
              <option value="">— Select MOM Player —</option>
              {allPlayers.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button size="sm" onClick={displayMOM} disabled={!momPlayerId}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              <Trophy className="w-4 h-4 mr-1" />MOM
            </Button>
          </div>
        </div>

        {/* Match Controls */}
        <div className="flex justify-between gap-3 pb-4">
          <Button variant="outline" onClick={endInnings} disabled={submitting} className="flex-1">End Innings</Button>
          <Button variant="outline" onClick={endMatch} disabled={submitting} className="flex-1 border-red-500/30 text-red-400">End Match</Button>
        </div>
      </div>

      {/* Wicket Dialog */}
      {showWicketDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="premium-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-400">🏏 Wicket!</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {['BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET'].map(type => (
                <Button key={type} variant={wicketType === type ? 'default' : 'outline'} onClick={() => setWicketType(type)} className="py-3">
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { setShowWicketDialog(false); setWicketType(''); }}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmWicket} disabled={!wicketType}>Confirm W</Button>
            </div>
          </div>
        </div>
      )}

      {/* Retire Batter Dialog */}
      {showRetireDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="premium-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-2">Retire Batter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Retire <span className="font-bold text-foreground">
                {battingTeamPlayers.find((p: any) => p.id === strikerId)?.name || 'striker'}
              </span> as Retired Hurt?
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowRetireDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={retireBatter}>Retire</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bowler Select Dialog */}
      {showBowlerSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="premium-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4">Select Bowler</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bowlingTeamPlayers.map((p: any) => (
                <Button key={p.id} variant={bowlerId === p.id ? 'default' : 'outline'} className="w-full justify-start"
                  onClick={() => { setBowlerId(p.id); setShowBowlerSelect(false); }}>
                  {p.name}
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setShowBowlerSelect(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Striker Select Dialog */}
      {showStrikerSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="premium-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-2">New Batsman</h3>
            <p className="text-muted-foreground text-sm mb-4">Select next batsman</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {battingTeamPlayers
                .filter((p: any) => p.id !== nonStrikerId && !notOutBatsmen.find((bs: any) => bs.playerId === p.id))
                .map((p: any) => (
                  <Button key={p.id} variant="outline" className="w-full justify-start"
                    onClick={() => { setStrikerId(p.id); setShowStrikerSelect(false); }}>
                    {p.name}
                  </Button>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setShowStrikerSelect(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
