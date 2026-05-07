'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function LiveIndicator({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-semibold bg-red-500/20 text-red-400 border border-red-500/30',
      sizes[size]
    )}>
      <span className={cn('bg-red-500 rounded-full animate-live-dot', dotSizes[size])} />
      LIVE
    </span>
  );
}

export function MatchCard({
  match,
}: {
  match: {
    id: string;
    status: string;
    team1: { name: string; logo?: string | null; color?: string };
    team2: { name: string; logo?: string | null; color?: string };
    score?: { team1: { runs: number; wickets: number; overs: string }; team2: { runs: number; wickets: number; overs: string } };
    venue?: string;
    scheduledAt?: string;
    result?: string | null;
    tournament?: string;
  };
}) {
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className="premium-card-hover p-5 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        {match.tournament && (
          <span className="text-xs text-muted-foreground font-medium">
            {match.tournament}
          </span>
        )}
        {isLive && <LiveIndicator />}
        {isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
            Completed
          </span>
        )}
        {!isLive && !isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            Upcoming
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: match.team1.color || '#6366f1' }}
            >
              {match.team1.name.charAt(0)}
            </div>
            <span className="font-semibold text-sm">{match.team1.name}</span>
          </div>
          {match.score && (
            <span className="text-lg font-bold">
              {match.score.team1.runs}/{match.score.team1.wickets}
              <span className="text-xs text-muted-foreground ml-1">
                ({match.score.team1.overs})
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: match.team2.color || '#6366f1' }}
            >
              {match.team2.name.charAt(0)}
            </div>
            <span className="font-semibold text-sm">{match.team2.name}</span>
          </div>
          {match.score && (
            <span className="text-lg font-bold">
              {match.score.team2.runs}/{match.score.team2.wickets}
              <span className="text-xs text-muted-foreground ml-1">
                ({match.score.team2.overs})
              </span>
            </span>
          )}
        </div>
      </div>

      {match.result && isCompleted && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-sm text-accent font-medium">{match.result}</p>
        </div>
      )}

      {match.venue && !isLive && !isCompleted && (
        <div className="mt-3 text-xs text-muted-foreground">
          {match.venue} • {match.scheduledAt}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="premium-card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-2 font-medium',
              trend.positive ? 'text-green-400' : 'text-red-400'
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
