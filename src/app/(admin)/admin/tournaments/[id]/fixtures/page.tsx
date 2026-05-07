'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Edit, Play, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  LIVE: "bg-red-500/20 text-red-400 border-red-500/50",
  SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/50",
}

export default function TournamentFixturesPage() {
  const params = useParams()
  const id = params.id as string
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(data => { setTournament(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  if (!tournament) return <div className="p-8 text-center text-red-400">Tournament not found</div>

  const matches = tournament?.matches || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fixtures</h1>
          <p className="text-muted-foreground">{tournament.name} • {matches.length} matches</p>
        </div>
        <Link href={`/admin/matches/create?tournamentId=${id}`}>
          <Button><Plus className="mr-2 h-4 w-4" />Add Fixture</Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No fixtures yet. Add your first match.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Match Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium">Match</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Venue</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m: any) => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4 font-medium">{m.team1?.name} vs {m.team2?.name}</td>
                      <td className="p-4 text-muted-foreground">{new Date(m.scheduledAt).toLocaleString()}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={statusColors[m.status] || ''}>{m.status}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{m.venue?.name || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {m.status === 'LIVE' && (
                            <Link href={`/scorer/scoring/${m.id}`}>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700"><Play className="w-3 h-3 mr-1" />Score</Button>
                            </Link>
                          )}
                          <Link href={`/admin/matches/${m.id}/setup`}>
                            <Button variant="outline" size="sm"><Eye className="w-3 h-3 mr-1" />{m.status === 'SCHEDULED' ? 'Setup' : 'View'}</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
