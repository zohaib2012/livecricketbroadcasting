'use client';

import { useEffect, useState } from 'react';
import { Trophy, Users, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tournaments: 0,
    teams: 0,
    matches: 0,
    liveMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tournaments').then(r => r.json()),
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/matches').then(r => r.json()),
    ]).then(([tournaments, teams, matches]) => {
      setStats({
        tournaments: tournaments.length || 0,
        teams: teams.length || 0,
        matches: matches.length || 0,
        liveMatches: matches.filter((m: any) => m.status === 'LIVE').length || 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const cards = [
    { title: 'Tournaments', value: stats.tournaments, icon: Trophy, href: '/admin/tournaments', color: 'from-amber-400 to-yellow-500' },
    { title: 'Teams', value: stats.teams, icon: Users, href: '/admin/teams', color: 'from-blue-400 to-indigo-500' },
    { title: 'Total Matches', value: stats.matches, icon: Target, href: '/admin/tournaments', color: 'from-green-400 to-emerald-500' },
    { title: 'Live Matches', value: stats.liveMatches, icon: TrendingUp, href: '/matches/live', color: 'from-red-400 to-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to CricLive Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="premium-card-hover cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/tournaments/create">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                + Create New Tournament
              </button>
            </Link>
            <Link href="/admin/teams/create">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                + Add New Team
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
