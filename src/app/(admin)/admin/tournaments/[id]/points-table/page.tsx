'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function PointsTablePage() {
  const params = useParams()
  const id = params.id as string
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = () => {
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(data => { setTournament(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const recalculate = async () => {
    setRecalculating(true)
    await fetch(`/api/tournaments/${id}/recalculate-points`, { method: 'POST' })
    await fetchData()
    setRecalculating(false)
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  if (!tournament) return <div className="p-8 text-center text-red-400">Tournament not found</div>

  const pointsTable = (tournament?.pointsTables || []).sort((a: any, b: any) => b.points - a.points || (b.nrr || 0) - (a.nrr || 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Points Table</h1>
          <p className="text-muted-foreground">{tournament.name}</p>
        </div>
        <Button onClick={recalculate} disabled={recalculating}>
          {recalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Recalculate Points
        </Button>
      </div>

      {pointsTable.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No points data yet. Complete some matches and recalculate.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">#</TableHead>
                    <TableHead className="text-left">Team</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>W</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead>T</TableHead>
                    <TableHead>NR</TableHead>
                    <TableHead>Pts</TableHead>
                    <TableHead>NRR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsTable.map((row: any, index: number) => (
                    <TableRow key={row.teamId} className={index < 4 ? "bg-green-500/5" : ""}>
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.team?.name}</TableCell>
                      <TableCell>{row.played}</TableCell>
                      <TableCell>{row.won}</TableCell>
                      <TableCell>{row.lost}</TableCell>
                      <TableCell>{row.tied}</TableCell>
                      <TableCell>{row.noResult}</TableCell>
                      <TableCell className="font-bold">{row.points}</TableCell>
                      <TableCell>{row.nrr?.toFixed(3) || '0.000'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
