"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditTeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teams">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Team</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input id="name" defaultValue="Mumbai Indians" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Team Color</Label>
            <div className="flex items-center gap-2">
              <Input id="color" type="color" className="w-16 h-10" defaultValue="#004BA0" />
              <Input defaultValue="#004BA0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeGround">Home Ground</Label>
            <Input id="homeGround" defaultValue="Wankhede Stadium" />
          </div>
          <div className="space-y-2">
            <Label>Team Logo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Current logo displayed</p>
              <Button variant="outline" className="mt-4">Change Logo</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Link href="/admin/teams">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button>Update Team</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
