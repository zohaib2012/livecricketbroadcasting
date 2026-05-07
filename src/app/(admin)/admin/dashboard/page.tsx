import { prisma } from '@/lib/prisma';
import { Trophy, Users, Target, Activity, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [tournamentsCount, teamsCount, matchesCount, liveCount] = await Promise.all([
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.match.count(),
    prisma.match.count({ where: { status: 'LIVE' } }),
  ]);

  const recentMatches = await prisma.match.findMany({
    include: { team1: true, team2: true, tournament: { select: { name: true } } },
    orderBy: { scheduledAt: 'desc' },
    take: 5,
  });

  const stats = [
    { label: 'Total Tournaments', value: String(tournamentsCount), icon: Trophy, color: 'from-indigo-500 to-purple-500' },
    { label: 'Active Teams', value: String(teamsCount), icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Matches', value: String(matchesCount), icon: Target, color: 'from-green-500 to-emerald-500' },
    { label: 'Live Now', value: String(liveCount), icon: Activity, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your cricket tournaments and matches</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="premium-card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn('text-3xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r', stat.color)}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/tournaments/create"><Card className="premium-card-hover cursor-pointer"><CardContent className="p-6 text-center"><Trophy className="w-8 h-8 mx-auto text-indigo-400 mb-3" /><h3 className="font-semibold">New Tournament</h3><p className="text-sm text-muted-foreground mt-1">Create a new tournament</p></CardContent></Card></Link>
        <Link href="/admin/teams/create"><Card className="premium-card-hover cursor-pointer"><CardContent className="p-6 text-center"><Users className="w-8 h-8 mx-auto text-blue-400 mb-3" /><h3 className="font-semibold">Add Team</h3><p className="text-sm text-muted-foreground mt-1">Register a new team</p></CardContent></Card></Link>
        <Link href="/admin/matches/create"><Card className="premium-card-hover cursor-pointer"><CardContent className="p-6 text-center"><Target className="w-8 h-8 mx-auto text-green-400 mb-3" /><h3 className="font-semibold">Schedule Match</h3><p className="text-sm text-muted-foreground mt-1">Create a new match</p></CardContent></Card></Link>
        <Link href="/admin/scorers"><Card className="premium-card-hover cursor-pointer"><CardContent className="p-6 text-center"><Calendar className="w-8 h-8 mx-auto text-amber-400 mb-3" /><h3 className="font-semibold">Manage Scorers</h3><p className="text-sm text-muted-foreground mt-1">Create & assign scorers</p></CardContent></Card></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Matches</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches.length === 0 && <p className="text-center text-muted-foreground py-8">No matches yet</p>}
            {recentMatches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                <div className="flex-1">
                  <p className="font-medium">{match.team1?.name} vs {match.team2?.name}</p>
                  {match.result && <p className="text-sm text-accent">{match.result}</p>}
                  <p className="text-sm text-muted-foreground">{new Date(match.scheduledAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={match.status === 'LIVE' ? 'live' : match.status === 'COMPLETED' ? 'success' : 'secondary'}>
                  {match.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
