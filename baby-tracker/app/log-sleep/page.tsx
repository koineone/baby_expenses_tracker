"use client"

import type React from "react"
import { format } from "date-fns"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LogSleep() {
  const router = useRouter()
  const [sleepStart, setSleepStart] = useState(() => {
    const now = new Date()
    now.setHours(now.getHours() - 1) // Default to 1 hour ago for sleep start
    return format(now, "yyyy-MM-dd'T'HH:mm")
  })
  const [sleepEnd, setSleepEnd] = useState(() => {
    const now = new Date()
    return format(now, "yyyy-MM-dd'T'HH:mm")
  })
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const activity = {
      id: Date.now().toString(),
      type: "sleep" as const,
      timestamp: new Date(sleepStart).toISOString(),
      sleepStart: new Date(sleepStart).toISOString(),
      sleepEnd: new Date(sleepEnd).toISOString(),
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

  const calculateDuration = () => {
    if (sleepStart && sleepEnd) {
      const start = new Date(sleepStart)
      const end = new Date(sleepEnd)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return duration > 0 ? duration.toFixed(1) : "0"
    }
    return "0"
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
              <Clock className="h-7 w-7 text-purple-600" />
              Log Sleep
            </h1>
            <p className="text-gray-600">Record sleep start and end times</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sleep Details</CardTitle>
            <CardDescription>Enter when baby fell asleep and woke up</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleepStart">Sleep Start</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sleepStart"
                      type="datetime-local"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSleepStart(format(new Date(), "yyyy-MM-dd'T'HH:mm"))}
                    >
                      Now
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleepEnd">Sleep End</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sleepEnd"
                      type="datetime-local"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSleepEnd(format(new Date(), "yyyy-MM-dd'T'HH:mm"))}
                    >
                      Now
                    </Button>
                  </div>
                </div>
              </div>

              {sleepStart && sleepEnd && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Sleep Duration: {calculateDuration()} hours</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Sleep quality, interruptions, location, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Sleep Record"}
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
            <CardTitle className="text-lg">Sleep Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Newborns: 14-17 hours per day</p>
            <p>• 1-3 months: 14-15 hours per day</p>
            <p>• 4-6 months: 12-15 hours per day</p>
            <p>• Track patterns to establish routines</p>
            <p>• Note sleep environment and conditions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
