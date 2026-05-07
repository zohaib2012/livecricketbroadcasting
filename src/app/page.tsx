import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Play, Users, Trophy, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            CricLive
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Live Cricket Scores & Broadcasting Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="outline" size="lg" className="text-lg bg-transparent text-white border-white hover:bg-white/10">
                View Tournaments
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <Trophy className="w-10 h-10 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Tournament Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Create and manage tournaments, teams, players, and fixtures with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <Play className="w-10 h-10 text-green-400 mb-2" />
              <CardTitle className="text-white">Live Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Real-time ball-by-ball scoring with instant updates to overlays and scorecards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">OBS Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Professional broadcast overlays for live streaming with customizable layouts.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
