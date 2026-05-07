import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const player = {
  name: "Virat Kohli",
  role: "Batsman",
  battingStyle: "Right-handed",
  bowlingStyle: "Right-arm medium",
  dateOfBirth: "November 5, 1988",
  teams: ["RCB", "India"],
}

const battingStats = {
  matches: 10,
  innings: 10,
  runs: 523,
  highest: "94",
  average: 52.3,
  strikeRate: 135.2,
  fifties: 4,
  hundreds: 0,
}

const bowlingStats = {
  matches: 10,
  innings: 0,
  wickets: 0,
  best: "-",
  average: "-",
  economy: "-",
}

const recentPerformances = [
  { match: "RCB vs GT", runs: 72, balls: 48, fours: 8, sixes: 2, date: "2026-05-08" },
  { match: "RCB vs KKR", runs: 45, balls: 32, fours: 5, sixes: 1, date: "2026-05-05" },
  { match: "RCB vs MI", runs: 28, balls: 22, fours: 3, sixes: 0, date: "2026-05-02" },
  { match: "RCB vs CSK", runs: 94, balls: 58, fours: 10, sixes: 3, date: "2026-04-28" },
  { match: "RCB vs DC", runs: 15, balls: 12, fours: 2, sixes: 0, date: "2026-04-25" },
]

export default function PlayerProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{player.name}</h1>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{player.role}</Badge>
          {player.teams.map((team) => (
            <Badge key={team} variant="outline">{team}</Badge>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>Batting: {player.battingStyle}</p>
          <p>Bowling: {player.bowlingStyle}</p>
          <p>DOB: {player.dateOfBirth}</p>
        </div>
      </div>
      <Tabs defaultValue="batting">
        <TabsList>
          <TabsTrigger value="batting">Batting Stats</TabsTrigger>
          <TabsTrigger value="bowling">Bowling Stats</TabsTrigger>
          <TabsTrigger value="recent">Recent Performances</TabsTrigger>
        </TabsList>
        <TabsContent value="batting" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-2xl font-bold">{battingStats.matches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Runs</p>
                  <p className="text-2xl font-bold">{battingStats.runs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">{battingStats.average}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Strike Rate</p>
                  <p className="text-2xl font-bold">{battingStats.strikeRate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Highest</p>
                  <p className="text-2xl font-bold">{battingStats.highest}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">50s</p>
                  <p className="text-2xl font-bold">{battingStats.fifties}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">100s</p>
                  <p className="text-2xl font-bold">{battingStats.hundreds}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bowling" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Matches</p>
                  <p className="text-2xl font-bold">{bowlingStats.matches}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wickets</p>
                  <p className="text-2xl font-bold">{bowlingStats.wickets}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best</p>
                  <p className="text-2xl font-bold">{bowlingStats.best}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">{bowlingStats.average}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economy</p>
                  <p className="text-2xl font-bold">{bowlingStats.economy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Runs</TableHead>
                    <TableHead>Balls</TableHead>
                    <TableHead>4s</TableHead>
                    <TableHead>6s</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPerformances.map((perf, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{perf.match}</TableCell>
                      <TableCell>{perf.runs}</TableCell>
                      <TableCell>{perf.balls}</TableCell>
                      <TableCell>{perf.fours}</TableCell>
                      <TableCell>{perf.sixes}</TableCell>
                      <TableCell className="text-muted-foreground">{perf.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
