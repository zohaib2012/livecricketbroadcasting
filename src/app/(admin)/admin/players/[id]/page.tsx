"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditPlayerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Player</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Player Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input id="name" defaultValue="Virat Kohli" />
          </div>
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Current photo displayed</p>
              <Button variant="outline" className="mt-4">Change Photo</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="Batsman">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Batsman">Batsman</SelectItem>
                  <SelectItem value="Bowler">Bowler</SelectItem>
                  <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                  <SelectItem value="Wicket-Keeper">Wicket-Keeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" defaultValue="1988-11-05" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="battingStyle">Batting Style</Label>
              <Input id="battingStyle" defaultValue="Right-handed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bowlingStyle">Bowling Style</Label>
              <Input id="bowlingStyle" defaultValue="Right-arm medium" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Link href="/admin/players">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button>Update Player</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
