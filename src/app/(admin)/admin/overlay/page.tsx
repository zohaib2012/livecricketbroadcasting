'use client'
import { useEffect, useState } from 'react'
import { Copy, Trash2, Plus, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

const THEMES = [
  { id: 'ipl', name: 'IPL Style', desc: 'Orange/blue gradients, bold score display', color: '#f97316' },
  { id: 'classic', name: 'Classic', desc: 'Traditional green cricket scoreboard', color: '#16a34a' },
  { id: 'neon', name: 'Neon Dark', desc: 'Black background with glowing neon accents', color: '#a855f7' },
]

export default function OverlayAdminPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('ipl')
  const [label, setLabel] = useState('')
  const [copiedId, setCopiedId] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/overlay-tokens').then(r => r.json()),
      fetch('/api/matches').then(r => r.json()),
    ]).then(([t, m]) => {
      setTokens(t)
      setMatches(m.filter((m: any) => m.status === 'LIVE' || m.status === 'SCHEDULED'))
      setLoading(false)
    })
  }, [])

  const createToken = async () => {
    if (!selectedMatch || !selectedTheme) return
    setCreating(true)
    const res = await fetch('/api/admin/overlay-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: selectedMatch, theme: selectedTheme, label }),
    })
    const data = await res.json()
    if (res.ok) {
      setTokens(prev => [data, ...prev])
      setLabel('')
    }
    setCreating(false)
  }

  const deleteToken = async (id: string) => {
    if (!confirm('Delete this token? The overlay link will stop working.')) return
    await fetch(`/api/admin/overlay-tokens/${id}`, { method: 'DELETE' })
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const getOverlayUrl = (token: any) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `${base}/overlay/${token.matchId}/full?theme=${token.theme}&token=${token.token}`
  }

  const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt)
  const daysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overlay Links</h1>
        <p className="text-muted-foreground mt-1">Generate paid overlay tokens for live stream broadcasting</p>
      </div>

      <Card className="border-indigo-500/30 bg-indigo-500/5">
        <CardContent className="p-4 text-sm space-y-1">
          <p className="font-semibold text-indigo-400">📡 How to use:</p>
          <p className="text-muted-foreground">1. Generate a token for an active match + select theme</p>
          <p className="text-muted-foreground">2. Copy the overlay URL</p>
          <p className="text-muted-foreground">3. Open PRISM Live / CameraFi → Add Browser Source → Paste URL</p>
          <p className="text-muted-foreground">4. Score balls in Scorer Panel → Overlay updates live with animations</p>
          <p className="text-muted-foreground">5. Token valid for <span className="text-white font-semibold">7 days</span> from creation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4" />Generate New Token</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Match</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedMatch}
              onChange={e => setSelectedMatch(e.target.value)}
            >
              <option value="">-- Select Match --</option>
              {matches.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.team1?.name} vs {m.team2?.name} • {m.status} {m.tournament ? `• ${m.tournament.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-2 block">Select Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTheme === theme.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: theme.color }} />
                  <p className="font-semibold text-sm">{theme.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{theme.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Label (optional)</Label>
            <input
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              placeholder="e.g. MI vs CSK Final - IPL Theme"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          <Button
            onClick={createToken}
            disabled={creating || !selectedMatch || !selectedTheme}
            className="w-full"
          >
            {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : '🔑 Generate 7-Day Token'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tokens ({tokens.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tokens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tokens generated yet.</p>
          ) : (
            tokens.map((t: any) => {
              const url = getOverlayUrl(t)
              const expired = isExpired(t.expiresAt)
              const days = daysLeft(t.expiresAt)
              const theme = THEMES.find(th => th.id === t.theme)

              return (
                <div key={t.id} className={`p-4 rounded-lg border ${expired ? 'border-red-500/30 bg-red-500/5' : 'border-border/50 bg-secondary/20'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme?.color || '#6366f1' }} />
                        <span className="font-semibold">{theme?.name} Theme</span>
                        {expired
                          ? <Badge variant="destructive" className="text-xs">Expired</Badge>
                          : <Badge className="text-xs bg-green-600">{days} days left</Badge>
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.match?.team1?.name} vs {t.match?.team2?.name}
                        {t.label && ` • ${t.label}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Expires: {new Date(t.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteToken(t.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-background/50 rounded-md p-2 font-mono text-xs text-muted-foreground truncate mb-3">
                    {url}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(url, t.id + '-overlay')}
                    >
                      {copiedId === t.id + '-overlay'
                        ? <><CheckCircle className="w-3 h-3 mr-1 text-green-400" />Copied!</>
                        : <><Copy className="w-3 h-3 mr-1" />Copy Overlay URL</>
                      }
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(url, t.id + '-camerafi')}
                    >
                      {copiedId === t.id + '-camerafi'
                        ? <><CheckCircle className="w-3 h-3 mr-1 text-green-400" />Copied!</>
                        : <><Copy className="w-3 h-3 mr-1" />Copy CameraFi URL</>
                      }
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.open(url, '_blank')}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
