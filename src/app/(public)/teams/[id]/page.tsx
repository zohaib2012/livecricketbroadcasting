import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const team = {
  name: "Mumbai Indians",
  color: "#004BA0",
  homeGround: "Wankhede Stadium",
  founded: 2008,
}

const squad = [
  { id: 1, name: "Rohit Sharma", role: "Batsman", battingStyle: "Right-handed", bowlingStyle: "Right-arm off-spin" },
  { id: 2, name: "Jasprit Bumrah", role: "Bowler", battingStyle: "Right-handed", bowlingStyle: "Right-arm fast" },
  { id: 3, name: "Suryakumar Yadav", role: "Batsman", battingStyle: "Right-handed", bowlingStyle: "Right-arm medium" },
  { id: 4, name: "Hardik Pandya", role: "All-Rounder", battingStyle: "Right-handed", bowlingStyle: "Right-arm fast-medium" },
  { id: 5, name: "Ishan Kishan", role: "Wicket-Keeper", battingStyle: "Left-handed", bowlingStyle: "Right-arm medium" },
]

const recentMatches = [
  { opponent: "Chennai Super Kings", result: "Won by 5 wickets", date: "2026-05-08" },
  { opponent: "Royal Challengers Bangalore", result: "Lost by 17 runs", date: "2026-05-05" },
  { opponent: "Gujarat Titans", result: "Won by 3 wickets", date: "2026-05-02" },
]

const playerStats = [
  { name: "Rohit Sharma", matches: 10, runs: 345, avg: 34.5, strikeRate: 130.2 },
  { name: "Jasprit Bumrah", matches: 10, wickets: 18, economy: 6.8, avg: 18.5 },
  { name: "Suryakumar Yadav", matches: 10, runs: 412, avg: 41.2, strikeRate: 145.8 },
]

export default function TeamProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full" style={{ backgroundColor: team.color }} />
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.homeGround} • Founded {team.founded}</p>
        </div>
      </div>
      <Tabs defaultValue="squad">
        <TabsList>
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="recent-matches">Recent Matches</TabsTrigger>
          <TabsTrigger value="stats">Player Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="squad" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Batting</TableHead>
                    <TableHead>Bowling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {squad.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{player.battingStyle}</TableCell>
                      <TableCell className="text-muted-foreground">{player.bowlingStyle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent-matches" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatches.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">vs {match.opponent}</TableCell>
                      <TableCell>
                        <Badge variant={match.result.includes("Won") ? "default" : "destructive"}>
                          {match.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{match.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>M</TableHead>
                    <TableHead>Runs</TableHead>
                    <TableHead>Avg</TableHead>
                    <TableHead>SR</TableHead>
                    <TableHead>Wickets</TableHead>
                    <TableHead>Economy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((player) => (
                    <TableRow key={player.name}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{player.matches}</TableCell>
                      <TableCell>{player.runs || "-"}</TableCell>
                      <TableCell>{player.avg || "-"}</TableCell>
                      <TableCell>{player.strikeRate || "-"}</TableCell>
                      <TableCell>{player.wickets || "-"}</TableCell>
                      <TableCell>{player.economy || "-"}</TableCell>
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
