'use client'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = matches.filter(m => {
    const matchesSearch = 
      m.team1?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.team2?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.tournament?.name?.toLowerCase().includes(search.toLowerCase())
    if (tab === 'all') return matchesSearch
    if (tab === 'live') return matchesSearch && m.status === 'LIVE'
    if (tab === 'upcoming') return matchesSearch && m.status === 'SCHEDULED'
    if (tab === 'completed') return matchesSearch && m.status === 'COMPLETED'
    return matchesSearch
  })

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading matches...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Cricket Matches</h1>
        <p className="text-muted-foreground mt-1">Follow live scores and match updates</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search teams or tournament..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No matches found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m: any) => (
            <Card key={m.id} className="premium-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {m.tournament && <span className="text-sm text-muted-foreground">{m.tournament.name} • {m.tournament.format}</span>}
                  <Badge variant={m.status === 'LIVE' ? 'live' : m.status === 'COMPLETED' ? 'success' : 'secondary'}>
                    {m.status === 'LIVE' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2 inline-block" />}
                    {m.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 mb-4">
                  <div className="text-right">
                    <h3 className="font-semibold text-lg">{m.team1?.name}</h3>
                  </div>
                  <div className="text-center text-muted-foreground font-semibold">VS</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{m.team2?.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">
                    {new Date(m.scheduledAt).toLocaleString()} {m.venue?.name && `• ${m.venue.name}`}
                  </span>
                  <Link href={`/matches/${m.id}`}>
                    <Button variant="outline" size="sm">View Match</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
