"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Milk } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function LogFeeding() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [feedingDateTime, setFeedingDateTime] = useState(() => {
    const now = new Date()
    return format(now, "yyyy-MM-dd'T'HH:mm")
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const activity = {
      id: Date.now().toString(),
      type: "feeding" as const,
      timestamp: new Date(feedingDateTime).toISOString(),
      amount: Number.parseInt(amount),
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
              <Milk className="h-7 w-7 text-blue-600" />
              Log Feeding
            </h1>
            <p className="text-gray-600">Record feeding time and amount</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Feeding Details</CardTitle>
            <CardDescription>Enter the amount of formula and any additional notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <div className="flex gap-2">
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={feedingDateTime}
                    onChange={(e) => setFeedingDateTime(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFeedingDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"))}
                  >
                    Now
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Time auto-set to now. Adjust if logging a past feeding.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ml)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 120"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max="500"
                />
                <p className="text-sm text-gray-500">
                  Typical amounts: Newborn (60-90ml), 1-3 months (90-150ml), 3-6 months (150-210ml)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any observations, baby's mood, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Saving..." : "Save Feeding"}
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
            <CardTitle className="text-lg">Feeding Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Newborns typically feed every 2-3 hours</p>
            <p>• Watch for hunger cues: rooting, sucking motions, fussiness</p>
            <p>• Burp baby halfway through and after feeding</p>
            <p>• Track patterns to predict next feeding time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
