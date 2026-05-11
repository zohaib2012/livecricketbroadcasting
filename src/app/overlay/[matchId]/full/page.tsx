'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMatchChannel, unsubscribeMatch } from '@/lib/socket';

const THEMES = {
  default: {
    header: 'bg-indigo-600',
    wrapper: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900',
    scoreColor: 'text-white',
    accentBg: 'bg-gray-800/50',
    liveBadge: 'bg-red-500',
    tableHeader: 'text-gray-400',
    tableBorder: 'border-gray-700',
  },
  ipl: {
    header: 'bg-gradient-to-r from-orange-600 to-blue-700',
    wrapper: 'bg-gradient-to-r from-orange-950 via-gray-900 to-blue-950',
    scoreColor: 'text-yellow-300',
    accentBg: 'bg-orange-900/30',
    liveBadge: 'bg-orange-500',
    tableHeader: 'text-orange-200',
    tableBorder: 'border-orange-800/50',
  },
  classic: {
    header: 'bg-green-800',
    wrapper: 'bg-gradient-to-r from-green-950 via-green-900 to-green-950',
    scoreColor: 'text-white',
    accentBg: 'bg-green-800/30',
    liveBadge: 'bg-green-600',
    tableHeader: 'text-green-300',
    tableBorder: 'border-green-800',
  },
  neon: {
    header: 'bg-black border-b border-purple-500',
    wrapper: 'bg-black',
    scoreColor: 'text-green-400',
    accentBg: 'bg-gray-900',
    liveBadge: 'bg-purple-600',
    tableHeader: 'text-purple-300',
    tableBorder: 'border-purple-900/50',
  },
};

const ANIMATION_CONFIGS: Record<string, Record<string, { text: string; color: string; bg: string }>> = {
  default: {
    FOUR: { text: 'FOUR!', color: 'text-yellow-300', bg: 'from-yellow-900/80 to-yellow-600/80' },
    SIX: { text: 'SIX!', color: 'text-purple-300', bg: 'from-purple-900/80 to-purple-600/80' },
    WICKET: { text: 'WICKET!', color: 'text-red-300', bg: 'from-red-900/80 to-red-600/80' },
    FREE_HIT: { text: 'FREE HIT!', color: 'text-green-300', bg: 'from-green-900/80 to-green-600/80' },
    HAT_TRICK: { text: 'HAT-TRICK BALL!', color: 'text-cyan-300', bg: 'from-cyan-900/80 to-cyan-600/80' },
  },
  ipl: {
    FOUR: { text: 'FOUR!', color: 'text-yellow-400', bg: 'from-orange-900/90 to-orange-700/90' },
    SIX: { text: 'SIX!', color: 'text-white', bg: 'from-blue-900/90 to-blue-700/90' },
    WICKET: { text: 'OUT!', color: 'text-red-300', bg: 'from-red-950/95 to-red-800/95' },
    FREE_HIT: { text: 'FREE HIT!', color: 'text-green-300', bg: 'from-green-900/90 to-green-700/90' },
    HAT_TRICK: { text: 'HAT-TRICK!', color: 'text-cyan-300', bg: 'from-cyan-900/90 to-cyan-700/90' },
  },
  classic: {
    FOUR: { text: 'BOUNDARY 4', color: 'text-white', bg: 'from-green-900/90 to-green-700/90' },
    SIX: { text: 'MAXIMUM 6', color: 'text-yellow-300', bg: 'from-green-950/90 to-green-800/90' },
    WICKET: { text: 'WICKET!', color: 'text-red-300', bg: 'from-green-950/95 to-red-900/80' },
    FREE_HIT: { text: 'FREE HIT!', color: 'text-green-300', bg: 'from-green-900/90 to-green-700/90' },
    HAT_TRICK: { text: 'HAT-TRICK!', color: 'text-cyan-300', bg: 'from-green-950/95 to-cyan-900/80' },
  },
  neon: {
    FOUR: { text: 'FOUR!', color: 'text-green-400', bg: 'from-black to-black' },
    SIX: { text: 'SIX!', color: 'text-cyan-400', bg: 'from-black to-black' },
    WICKET: { text: 'WICKET!', color: 'text-red-400', bg: 'from-black to-black' },
    FREE_HIT: { text: 'FREE HIT!', color: 'text-yellow-400', bg: 'from-black to-black' },
    HAT_TRICK: { text: 'HAT-TRICK!', color: 'text-purple-400', bg: 'from-black to-black' },
  },
};

export default function FullOverlay({ params }: { params: { matchId: string } }) {
  const searchParams = useSearchParams();
  const themeParam = searchParams.get('theme') || 'default';
  const tokenParam = searchParams.get('token') || '';

  const [data, setData] = useState<any>(null);
  const [displayMode, setDisplayMode] = useState('DEFAULT');
  const [animation, setAnimation] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const displayHandlerRef = useRef<(d: { mode: string }) => void>();
  const animateHandlerRef = useRef<(d: { type: string }) => void>();

  const theme = themeParam === 'default' || tokenValid ? themeParam : 'default';
  const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.default;
  const animConfigs = ANIMATION_CONFIGS[themeParam as keyof typeof ANIMATION_CONFIGS] || ANIMATION_CONFIGS.default;

  useEffect(() => {
    if (!tokenParam || themeParam === 'default') {
      setTokenValid(true);
      setTokenChecked(true);
      return;
    }
    fetch(`/api/overlay/validate?token=${tokenParam}`)
      .then(r => r.json())
      .then(data => {
        setTokenValid(data.valid && data.theme === themeParam);
        setTokenChecked(true);
      })
      .catch(() => { setTokenValid(false); setTokenChecked(true); });
  }, [tokenParam, themeParam]);

  useEffect(() => {
    fetch(`/api/matches/${params.matchId}/live`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});

    const channel = getMatchChannel(params.matchId);
    channel.bind('score_updated', setData);
    channel.bind('overlay_display', ({ mode }: { mode: string }) => setDisplayMode(mode));
    channel.bind('overlay_animate', ({ type }: { type: string }) => {
      setAnimation(type || null);
      if (type) setTimeout(() => setAnimation(null), 3000);
    });

    return () => {
      channel.unbind('score_updated', setData);
      channel.unbind_all();
      unsubscribeMatch(params.matchId);
    };
  }, [params.matchId]);

  if (!tokenChecked) return null;

  const s = activeTheme;

  const AnimationLayer = () => {
    if (!animation) return null;
    const cfg = animConfigs[animation];
    if (!cfg) return null;
    const isNeon = themeParam === 'neon';
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${cfg.bg}`}
        style={{ animation: 'fadeInScale 0.3s ease-out' }}
      >
        <div
          className={`text-8xl font-black tracking-widest ${cfg.color} ${isNeon ? 'neon-text' : ''} drop-shadow-2xl`}
          style={{ animation: 'bounce 0.5s infinite alternate' }}
        >
          {cfg.text}
        </div>
      </div>
    );
  };

  if (!data || !data.currentInnings) {
    return (
      <div className="w-full" style={{ background: 'transparent' }}>
        <style>{`
          @keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
          ${themeParam === 'neon' ? `.neon-text { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor; }` : ''}
        `}</style>
        {tokenParam && !tokenValid && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.85)',
            padding: '8px 16px',
            textAlign: 'center',
            color: '#facc15',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 100
          }}>
            Premium Theme Token Invalid or Expired
          </div>
        )}
        <div className="min-h-[100px] flex items-center justify-center">
          <div className={`text-lg font-semibold ${s.scoreColor}`}>Waiting for match data...</div>
        </div>
      </div>
    );
  }

  const innings = data.currentInnings;
  const match = data.match;
  const overs = Math.floor(innings.totalBalls / 6);
  const balls = innings.totalBalls % 6;
  const crr = innings.totalBalls === 0 ? '0.00' : (innings.totalRuns / (innings.totalBalls / 6)).toFixed(2);
  const batsmen = (innings.battingScorecards || []).filter((bs: any) => !bs.howOut).slice(0, 2);
  const bowler = innings.bowlingScorecards?.[0];
  const lastBalls = [...(innings.balls || [])].reverse().slice(0, 6);

  const DefaultView = ({ theme: t }: { theme?: string }) => {
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    const isNeon = t === 'neon';
    return (
      <div className={`w-full rounded-lg overflow-hidden shadow-2xl ${st.wrapper}`}>
        <div className={`flex items-center justify-between px-6 py-3 ${st.header}`}>
          <span className="text-white font-bold text-lg">
            {match?.tournament?.name || 'Match'} • {match?.team1?.name?.split(' ').map((w: string) => w[0]).join('')} vs {match?.team2?.name?.split(' ').map((w: string) => w[0]).join('')}
          </span>
          <span className={`text-white font-bold text-xs ${st.liveBadge} px-2 py-1 rounded animate-pulse`}>● LIVE</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: innings.battingTeam?.color || '#6366f1' }}>
                {innings.battingTeam?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
              </div>
              <div>
                <p className={`font-semibold ${st.scoreColor}`}>{innings.battingTeam?.name}</p>
                <p className={`text-4xl font-black ${st.scoreColor}`}>
                  {innings.totalRuns}/{innings.wickets}{' '}
                  <span className="text-xl text-gray-400">({overs}.{balls})</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">CRR: {crr}</p>
              {data.target && <p className="text-gray-400 text-sm">Need {data.target - innings.totalRuns} runs</p>}
            </div>
          </div>
          {batsmen.length > 0 && (
            <div className={`${st.accentBg} rounded-lg p-4 mb-4`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${st.tableHeader} border-b ${st.tableBorder}`}>
                    <th className="text-left pb-2 font-medium">Batter</th>
                    <th className="text-center pb-2 font-medium">R</th>
                    <th className="text-center pb-2 font-medium">B</th>
                    <th className="text-center pb-2 font-medium">4s</th>
                    <th className="text-center pb-2 font-medium">6s</th>
                    <th className="text-center pb-2 font-medium">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {batsmen.map((bs: any) => (
                    <tr key={bs.playerId} className={isNeon ? 'text-green-300' : 'text-white'}>
                      <td className={`py-2 font-medium ${isNeon ? 'text-green-200' : ''}`}>{bs.player?.name}</td>
                      <td className={`text-center font-bold text-lg ${isNeon ? 'text-cyan-400' : ''}`}>{bs.runs}</td>
                      <td className="text-center text-gray-400">{bs.balls}</td>
                      <td className="text-center text-gray-400">{bs.fours}</td>
                      <td className="text-center text-gray-400">{bs.sixes}</td>
                      <td className="text-center">{bs.strikeRate?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {bowler && (
            <div className={`${st.accentBg} rounded-lg p-4`}>
              <div className={`flex items-center justify-between text-sm ${isNeon ? 'text-green-300' : 'text-white'}`}>
                <span className="font-medium">{bowler.player?.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{bowler.overs}-{bowler.maidens || 0}-{bowler.runs}-{bowler.wickets}</span>
                  <span className="text-gray-400">Econ: {bowler.economy?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          {lastBalls.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-gray-400 text-sm mr-2">This over:</span>
              {lastBalls.map((ball: any, i: number) => (
                <span key={i} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                  ball.isWicket ? 'bg-red-500/20 text-red-400' :
                  ball.runs === 6 ? 'bg-green-500/20 text-green-400' :
                  ball.runs === 4 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {ball.isWicket ? 'W' : ball.isWide ? 'Wd' : ball.isNoBall ? 'Nb' : ball.runs}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BattingView = ({ theme: t }: { theme?: string }) => {
    const allBatsmen = innings.battingScorecards || [];
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    const isNeon = t === 'neon';
    return (
      <div className={`${st.wrapper} rounded-lg overflow-hidden shadow-2xl`}>
        <div className={`px-4 py-2 ${st.header} flex justify-between items-center`}>
          <span className="text-white font-bold">{innings.battingTeam?.name} — Batting</span>
          <span className="text-white text-sm">{innings.totalRuns}/{innings.wickets} ({overs}.{balls})</span>
        </div>
        <div className="p-4">
          <table className="w-full text-sm text-white">
            <thead>
              <tr className={`${st.tableHeader} border-b ${st.tableBorder} text-xs`}>
                <th className="text-left pb-1">Batter</th>
                <th className="text-center pb-1">R</th>
                <th className="text-center pb-1">B</th>
                <th className="text-center pb-1">4s</th>
                <th className="text-center pb-1">6s</th>
                <th className="text-center pb-1">SR</th>
              </tr>
            </thead>
            <tbody>
              {allBatsmen.map((bs: any) => (
                <tr key={bs.playerId} className={bs.howOut ? 'text-gray-500' : isNeon ? 'text-green-300' : 'text-white'}>
                  <td className="py-1">
                    {bs.player?.name}
                    {bs.howOut && <span className="text-xs ml-1">({bs.howOut.replace('_', ' ')})</span>}
                  </td>
                  <td className={`text-center font-bold ${isNeon && !bs.howOut ? 'text-cyan-400' : ''}`}>{bs.runs}</td>
                  <td className="text-center">{bs.balls}</td>
                  <td className="text-center">{bs.fours}</td>
                  <td className="text-center">{bs.sixes}</td>
                  <td className="text-center">{bs.strikeRate?.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const BowlingView = ({ theme: t }: { theme?: string }) => {
    const allBowlers = innings.bowlingScorecards || [];
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    const isNeon = t === 'neon';
    return (
      <div className={`${st.wrapper} rounded-lg overflow-hidden shadow-2xl`}>
        <div className={`px-4 py-2 ${st.header} flex justify-between items-center`}>
          <span className="text-white font-bold">{innings.bowlingTeam?.name} — Bowling</span>
        </div>
        <div className="p-4">
          <table className={`w-full text-sm ${isNeon ? 'text-green-300' : 'text-white'}`}>
            <thead>
              <tr className={`${st.tableHeader} border-b ${st.tableBorder} text-xs`}>
                <th className="text-left pb-1">Bowler</th>
                <th className="text-center pb-1">O</th>
                <th className="text-center pb-1">M</th>
                <th className="text-center pb-1">R</th>
                <th className="text-center pb-1">W</th>
                <th className="text-center pb-1">Eco</th>
              </tr>
            </thead>
            <tbody>
              {allBowlers.map((bs: any) => (
                <tr key={bs.playerId} className={isNeon ? 'text-green-300' : 'text-white'}>
                  <td className="py-1">{bs.player?.name}</td>
                  <td className="text-center">{bs.overs}</td>
                  <td className="text-center">{bs.maidens || 0}</td>
                  <td className="text-center">{bs.runs}</td>
                  <td className={`text-center font-bold ${isNeon ? 'text-red-400' : 'text-red-400'}`}>{bs.wickets}</td>
                  <td className="text-center">{bs.economy?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const FowView = ({ theme: t }: { theme?: string }) => {
    const fow = innings.fallOfWickets || [];
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    return (
      <div className={`${st.wrapper} rounded-lg overflow-hidden shadow-2xl`}>
        <div className={`px-4 py-2 ${st.header}`}>
          <span className="text-white font-bold">Fall of Wickets</span>
        </div>
        <div className="p-4">
          {fow.length === 0 ? (
            <p className="text-gray-400 text-sm">No wickets yet</p>
          ) : (
            <div className="space-y-1">
              {fow.map((f: any) => (
                <div key={f.id} className="flex justify-between text-sm text-white">
                  <span className="text-gray-400">{f.wicketNumber}-{f.runs}</span>
                  <span>{f.player?.name}</span>
                  <span className="text-gray-400">{f.overs} ov</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TargetView = ({ theme: t }: { theme?: string }) => {
    if (!data.target) return null;
    const needed = data.target - innings.totalRuns;
    const ballsLeft = 120 - innings.totalBalls;
    const rrr = ballsLeft > 0 ? ((needed / ballsLeft) * 6).toFixed(2) : '0.00';
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    return (
      <div className={`${st.wrapper} rounded-lg overflow-hidden shadow-2xl`}>
        <div className={`px-4 py-2 ${st.header}`}>
          <span className="text-white font-bold">Target Chase</span>
        </div>
        <div className="p-6 text-center text-white space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Target</p>
            <p className={`text-5xl font-black ${st.scoreColor}`}>{data.target}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Need</p>
              <p className="text-2xl font-bold text-yellow-400">{needed}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Balls Left</p>
              <p className="text-2xl font-bold">{ballsLeft}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Req RR</p>
              <p className="text-2xl font-bold text-red-400">{rrr}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PartnershipView = ({ theme: t }: { theme?: string }) => {
    const notOut = batsmen.filter((bs: any) => !bs.howOut);
    if (notOut.length < 2) return <DefaultView theme={t} />;
    const partRuns = notOut.reduce((s: number, b: any) => s + (b.runs || 0), 0);
    const partBalls = notOut.reduce((s: number, b: any) => s + (b.balls || 0), 0);
    const st = THEMES[(t as keyof typeof THEMES) || 'default'] || THEMES.default;
    return (
      <div className={`${st.wrapper} rounded-lg overflow-hidden shadow-2xl`}>
        <div className={`px-4 py-2 ${st.header} flex justify-between items-center`}>
          <span className="text-white font-bold">Partnership</span>
          <span className="text-white text-sm">{partRuns} runs ({partBalls} balls)</span>
        </div>
        <div className="p-4 flex justify-around text-white">
          {notOut.map((bs: any) => (
            <div key={bs.playerId} className="text-center">
              <p className="font-medium text-sm">{bs.player?.name}</p>
              <p className={`text-3xl font-black ${st.scoreColor}`}>{bs.runs}</p>
              <p className="text-gray-400 text-sm">({bs.balls})</p>
              <p className="text-xs text-gray-400">SR: {bs.strikeRate?.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderView = (activeTheme: string) => {
    switch (displayMode) {
      case 'BATTING': return <BattingView theme={activeTheme} />;
      case 'BOWLING': return <BowlingView theme={activeTheme} />;
      case 'FOW': return <FowView theme={activeTheme} />;
      case 'TARGET': return <TargetView theme={activeTheme} />;
      case 'PARTNERSHIP': return <PartnershipView theme={activeTheme} />;
      default: return <DefaultView theme={activeTheme} />;
    }
  };

  return (
    <div className="w-full" style={{ fontFamily: 'Inter, sans-serif', background: 'transparent' }}>
      <style>{`
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        ${themeParam === 'neon' ? `.neon-text { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor; }` : ''}
      `}</style>
      {tokenParam && !tokenValid && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.85)',
          padding: '8px 16px',
          textAlign: 'center',
          color: '#facc15',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          Premium Theme Token Invalid or Expired
        </div>
      )}
      <AnimationLayer />
      {renderView(theme)}
    </div>
  );
}
