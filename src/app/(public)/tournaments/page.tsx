'use client'
import { useEffect, useState } from 'react'
import { Search, Trophy, Calendar, Users, Filter, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then(data => { setTournaments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredTournaments = tournaments.filter((t: any) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedTab === 'all') return matchesSearch
    return matchesSearch && t.status?.toLowerCase() === selectedTab
  })

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Cricket Tournaments</h1>
        <p className="text-muted-foreground text-lg">Explore live and upcoming cricket tournaments</p>
      </div>

      <div className="flex items-center gap-4 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tournaments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ongoing">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Past</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab} className="space-y-6 mt-6">
          {filteredTournaments.length === 0 && <p className="text-center text-muted-foreground py-12">No tournaments found</p>}
          {filteredTournaments.map((t: any) => (
            <Card key={t.id} className="premium-card-hover overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">{t.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{t._count?.tournamentTeams || 0} Teams</span>
                        <span>• {t.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'ONGOING' ? 'live' : t.status === 'COMPLETED' ? 'success' : 'secondary'}>{t.status}</Badge>
                    <Link href={`/tournaments/${t.id}`}>
                      <Button variant="outline" size="sm" className="group">View Details<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
