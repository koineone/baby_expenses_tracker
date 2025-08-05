"use client"

import type React from "react"
import { format } from "date-fns"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export default function LogDiaper() {
  const router = useRouter()
  const [diaperType, setDiaperType] = useState<"wet" | "dirty" | "both">("wet")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diaperDateTime, setDiaperDateTime] = useState(() => {
    const now = new Date()
    return format(now, "yyyy-MM-dd'T'HH:mm")
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const activity = {
      id: Date.now().toString(),
      type: "diaper" as const,
      timestamp: new Date(diaperDateTime).toISOString(),
      diaperType,
      notes: notes.trim() || undefined,
    }

    // Get existing activities
    const existing = localStorage.getItem("babyActivities")
    const activities = existing ? JSON.parse(existing) : []

    // Add new activity
    activities.push(activity)
    localStorage.setItem("babyActivities", JSON.stringify(activities))

    // Redirect back to dashboard
    setTimeout(() => {
      router.push("/")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🍼</span>
              Log Diaper Change
            </h1>
            <p className="text-gray-600">Record diaper change details</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Diaper Change Details</CardTitle>
            <CardDescription>Select the type of diaper change and add any notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Diaper Type</Label>
                <RadioGroup
                  value={diaperType}
                  onValueChange={(value: "wet" | "dirty" | "both") => setDiaperType(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wet" id="wet" />
                    <Label htmlFor="wet" className="flex items-center gap-2">
                      💧 Wet only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dirty" id="dirty" />
                    <Label htmlFor="dirty" className="flex items-center gap-2">
                      💩 Dirty only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="flex items-center gap-2">
                      💧💩 Both wet and dirty
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <div className="flex gap-2">
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={diaperDateTime}
                    onChange={(e) => setDiaperDateTime(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDiaperDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))}
                  >
                    Now
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Time auto-set to now. Adjust if logging a past diaper change.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Color, consistency, any concerns, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Diaper Change"}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diaper Change Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Newborns: 8-12 diapers per day</p>
            <p>• 1-5 months: 6-8 diapers per day</p>
            <p>• Change immediately after dirty diapers</p>
            <p>• Wet diapers can wait 2-3 hours if baby is comfortable</p>
            <p>• Track patterns to estimate monthly diaper needs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
