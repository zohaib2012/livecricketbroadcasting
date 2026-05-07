'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Calendar, Users, ArrowLeft, TrendingUp, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function TournamentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [tournament, setTournament] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError('Tournament not found'); setLoading(false); return }
        setTournament(data)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (error || !tournament) return (
    <div className="text-center py-20 text-muted-foreground">{error || 'Not found'}</div>
  )

  const matches = tournament.matches || []
  const pointsTable = tournament.pointsTables || []
  const teams = tournament.tournamentTeams?.map((tt: any) => tt.team) || []

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ONGOING': return <Badge className="bg-green-500 hover:bg-green-600">Ongoing</Badge>
      case 'UPCOMING': return <Badge variant="outline">Upcoming</Badge>
      case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>
      case 'LIVE': return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tournaments">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            {getStatusBadge(tournament.status)}
          </div>
          <p className="text-muted-foreground">{tournament.format} • {tournament.type} Tournament</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="premium-card-hover">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{tournament._count?.matches || 0}</p>
            <p className="text-sm text-muted-foreground">Total Matches</p>
          </CardContent>
        </Card>
        <Card className="premium-card-hover">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{tournament._count?.tournamentTeams || 0}</p>
            <p className="text-sm text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card className="premium-card-hover">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold">{tournament.format}</p>
            <p className="text-sm text-muted-foreground">Format</p>
          </CardContent>
        </Card>
        <Card className="premium-card-hover">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold">{tournament.type}</p>
            <p className="text-sm text-muted-foreground">Type</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="points-table">Points Table</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="premium-card-hover">
            <CardHeader><CardTitle>Tournament Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Start: {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">End: {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Format: {tournament.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Type: {tournament.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4 mt-6">
          {matches.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No matches scheduled yet</p>
          ) : matches.map((match: any) => (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <Card className="premium-card-hover cursor-pointer mb-3">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : ''}
                      {match.venue ? ` • ${match.venue.name}` : ''}
                    </span>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <h3 className="font-semibold">{match.team1?.name}</h3>
                        <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: match.team1?.color || '#6366f1' }}>
                          {match.team1?.name?.charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-muted-foreground font-bold text-sm">VS</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: match.team2?.color || '#6366f1' }}>
                          {match.team2?.name?.charAt(0)}
                        </div>
                        <h3 className="font-semibold">{match.team2?.name}</h3>
                      </div>
                    </div>
                  </div>
                  {match.result && (
                    <div className="mt-4 p-2 bg-muted rounded-lg text-center">
                      <p className="font-semibold text-sm">{match.result}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="points-table" className="mt-6">
          <Card className="premium-card-hover">
            <CardHeader><CardTitle>Points Table</CardTitle></CardHeader>
            <CardContent>
              {pointsTable.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data yet — points update after matches complete</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Team</th>
                        <th className="text-center p-2">P</th>
                        <th className="text-center p-2">W</th>
                        <th className="text-center p-2">L</th>
                        <th className="text-center p-2">Pts</th>
                        <th className="text-center p-2">NRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsTable.map((row: any, index: number) => (
                        <tr key={row.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-muted-foreground text-sm">{index + 1}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: row.team?.color || '#6366f1' }}>
                                {row.team?.name?.charAt(0)}
                              </div>
                              <span className="font-semibold">{row.team?.name}</span>
                            </div>
                          </td>
                          <td className="text-center p-2">{row.played}</td>
                          <td className="text-center p-2 text-green-600">{row.won}</td>
                          <td className="text-center p-2 text-red-600">{row.lost}</td>
                          <td className="text-center p-2 font-bold">{row.points}</td>
                          <td className="text-center p-2 text-sm">{Number(row.nrr) >= 0 ? '+' : ''}{Number(row.nrr).toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          {teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No teams added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team: any) => (
                <Card key={team.id} className="premium-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: team.color || '#6366f1' }}>
                        {team.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        {team.shortName && <p className="text-sm text-muted-foreground">{team.shortName}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
