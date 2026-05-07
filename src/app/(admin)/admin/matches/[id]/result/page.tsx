'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

export default function MatchResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [winnerId, setWinnerId] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/matches/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError('Match not found'); setLoading(false); return }
        setMatch(data)
        if (data.winnerId) setWinnerId(data.winnerId)
        if (data.result) setResult(data.result)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [id])

  const handleSave = async () => {
    if (!winnerId) { setError('Select winner'); return }
    setSaving(true)
    const res = await fetch(`/api/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, result, status: 'COMPLETED' })
    })
    setSaving(false)
    if (res.ok) router.push('/admin/matches')
    else { const d = await res.json(); setError(d.error || 'Failed to save') }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  if (error && !match) return <div className="p-8 text-center text-red-400">{error}</div>

  const innings = match?.innings || []
  const team1 = match?.team1
  const team2 = match?.team2

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Match Result</h1>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        {innings.map((inn: any) => (
          <Card key={inn.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {inn.battingTeam?.name} - {inn.totalRuns}/{inn.wickets} ({Math.floor(inn.totalBalls/6)}.{inn.totalBalls%6})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {inn.battingScorecards?.filter((bs: any) => bs.runs > 0 || bs.balls > 0).map((bs: any) => (
                  <p key={bs.playerId} className="text-sm">
                    <span className="font-medium">{bs.player?.name}:</span> {bs.runs} ({bs.balls}) 
                    {bs.fours > 0 && ` 4s: ${bs.fours}`} {bs.sixes > 0 && ` 6s: ${bs.sixes}`}
                    {bs.howOut && <span className="text-muted-foreground"> - {bs.howOut.replace('_', ' ')}</span>}
                  </p>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-sm font-medium">Bowling</p>
                {inn.bowlingScorecards?.filter((bs: any) => bs.overs > 0).map((bs: any) => (
                  <p key={bs.playerId} className="text-sm text-muted-foreground">
                    {bs.player?.name}: {bs.overs} ov, {bs.runs} r, {bs.wickets} w
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Match Result</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Winner</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={team1?.id} id={team1?.id} />
                <Label htmlFor={team1?.id}>{team1?.name}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={team2?.id} id={team2?.id} />
                <Label htmlFor={team2?.id}>{team2?.name}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Result Summary</Label>
            <Input placeholder="e.g. Mumbai Indians won by 17 runs" value={result} onChange={e => setResult(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Link href="/admin/matches"><Button variant="outline">Cancel</Button></Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Result
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
