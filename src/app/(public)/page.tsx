import Link from 'next/link';
import { Trophy, Target, Users, TrendingUp, ArrowRight, Play, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchCard, LiveIndicator, StatCard } from '@/components/layout/match-card';
import { prisma } from '@/lib/prisma';

async function getData() {
  const [liveMatches, tournaments, allStats] = await Promise.all([
    prisma.match.findMany({
      where: { status: 'LIVE' },
      include: { team1: true, team2: true, tournament: { select: { name: true } }, innings: true },
      orderBy: { scheduledAt: 'desc' },
      take: 6,
    }),
    prisma.tournament.findMany({
      where: { status: { in: ['ONGOING', 'UPCOMING'] } },
      include: { _count: { select: { matches: true, tournamentTeams: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    Promise.all([
      prisma.match.count(),
      prisma.tournament.count(),
      prisma.team.count(),
      prisma.match.count({ where: { status: 'LIVE' } }),
    ]),
  ]);
  return { liveMatches, tournaments, allStats };
}

export default async function HomePage() {
  const { liveMatches, tournaments, allStats } = await getData();
  const [matchesCount, tournamentsCount, teamsCount, liveCount] = allStats;

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
                <LiveIndicator size="sm" />
                <span className="text-sm text-muted-foreground">{liveCount} live {liveCount === 1 ? 'match' : 'matches'} streaming now</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight animate-slide-in">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Live Cricket
                </span>
                <br />
                <span className="text-foreground">Scores & Broadcasting</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                Real-time scoring, professional scorecards, and OBS-ready overlays. 
                Broadcast your tournament like the pros.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-in">
                <Link href="/matches/live">
                  <button className="btn-premium">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Live
                  </button>
                </Link>
                <Link href="/tournaments">
                  <button className="btn-premium-secondary">
                    Browse Tournaments
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Live Matches" value={String(liveCount)} icon={<Target className="w-6 h-6" />} />
              <StatCard label="Tournaments" value={String(tournamentsCount)} icon={<Trophy className="w-6 h-6" />} />
              <StatCard label="Teams" value={String(teamsCount)} icon={<Users className="w-6 h-6" />} />
              <StatCard label="Total Matches" value={String(matchesCount)} icon={<TrendingUp className="w-6 h-6" />} />
            </div>
          </div>
        </section>

        {/* Live Matches Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {liveMatches.length > 0 ? 'Live Matches' : 'Recent Matches'}
                  </span>
                </h2>
                <p className="text-muted-foreground mt-1">{liveMatches.length > 0 ? 'Happening right now' : 'Latest matches'}</p>
              </div>
              <Link href="/matches" className="text-accent hover:text-accent/80 font-medium flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {liveMatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No matches scheduled yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveMatches.slice(0, 6).map(match => (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <MatchCard match={{
                      id: match.id,
                      status: match.status,
                      team1: { name: match.team1?.name, color: match.team1?.color || '#6366f1' },
                      team2: { name: match.team2?.name, color: match.team2?.color || '#6366f1' },
                      tournament: match.tournament?.name,
                    }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                    Featured Tournaments
                  </span>
                </h2>
                <p className="text-muted-foreground mt-1">Top tournaments streaming live</p>
              </div>
              <Link href="/tournaments" className="text-accent hover:text-accent/80 font-medium flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No tournaments yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tournaments.slice(0, 6).map(t => (
                  <Link key={t.id} href={`/tournaments/${t.id}`}>
                    <div className="premium-card-hover p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-black" />
                        </div>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          t.status === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'
                        )}>
                          {t.status === 'ONGOING' ? 'Live' : 'Upcoming'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Target className="w-4 h-4" />{t.format}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{t._count.tournamentTeams} Teams</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{t._count.matches} Matches</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="premium-card p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-purple-500/10" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Broadcast Your Tournament?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Set up professional scoring, live scorecards, and OBS overlays in minutes. 
                  Perfect for local tournaments, leagues, and academies.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/register">
                    <button className="btn-premium">Get Started Free<ArrowRight className="w-5 h-5 ml-2" /></button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-black text-white">C</span>
                </div>
                <span className="font-bold">CricLive</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/tournaments" className="hover:text-foreground">Tournaments</Link>
                <Link href="/matches" className="hover:text-foreground">Live Matches</Link>
                <Link href="/login" className="hover:text-foreground">Login</Link>
                <Link href="/register" className="hover:text-foreground">Sign Up</Link>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 CricLive. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
