"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Milk, Clock, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()
  const [quickFeedingAmount, setQuickFeedingAmount] = useState("120")
  const [isLogging, setIsLogging] = useState(false)

  const quickLogFeeding = async (amount: number) => {
    setIsLogging(true)

    const activity = {
      id: Date.now().toString(),
      type: "feeding" as const,
      timestamp: new Date().toISOString(),
      amount: amount,
      notes: "Quick logged",
    }

    const existing = localStorage.getItem("babyActivities")
    const activities = existing ? JSON.parse(existing) : []
    activities.push(activity)
    localStorage.setItem("babyActivities", JSON.stringify(activities))

    setTimeout(() => {
      setIsLogging(false)
      router.refresh()
    }, 500)
  }

  const quickLogDiaper = async (type: "wet" | "dirty" | "both") => {
    setIsLogging(true)

    const activity = {
      id: Date.now().toString(),
      type: "diaper" as const,
      timestamp: new Date().toISOString(),
      diaperType: type,
      notes: "Quick logged",
    }

    const existing = localStorage.getItem("babyActivities")
    const activities = existing ? JSON.parse(existing) : []
    activities.push(activity)
    localStorage.setItem("babyActivities", JSON.stringify(activities))

    setTimeout(() => {
      setIsLogging(false)
      router.refresh()
    }, 500)
  }

  const startSleepTimer = () => {
    const sleepStart = new Date().toISOString()
    localStorage.setItem("activeSleepStart", sleepStart)
    alert("Sleep timer started! Use 'End Sleep' when baby wakes up.")
  }

  const endSleepTimer = () => {
    const sleepStart = localStorage.getItem("activeSleepStart")
    if (!sleepStart) {
      alert("No active sleep timer found. Please start sleep tracking first.")
      return
    }

    const activity = {
      id: Date.now().toString(),
      type: "sleep" as const,
      timestamp: sleepStart,
      sleepStart: sleepStart,
      sleepEnd: new Date().toISOString(),
      notes: "Quick logged with timer",
    }

    const existing = localStorage.getItem("babyActivities")
    const activities = existing ? JSON.parse(existing) : []
    activities.push(activity)
    localStorage.setItem("babyActivities", JSON.stringify(activities))
    localStorage.removeItem("activeSleepStart")

    router.refresh()
  }

  const hasActiveSleep = localStorage.getItem("activeSleepStart") !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Quick Feeding */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 flex flex-col gap-1 bg-transparent" disabled={isLogging}>
                <Milk className="h-5 w-5 text-blue-600" />
                <span className="text-xs">Quick Feed</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Log Feeding</DialogTitle>
                <DialogDescription>Log a feeding with current time</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (ml)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={quickFeedingAmount}
                    onChange={(e) => setQuickFeedingAmount(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => quickLogFeeding(90)} variant="outline" size="sm">
                    90ml
                  </Button>
                  <Button onClick={() => quickLogFeeding(120)} variant="outline" size="sm">
                    120ml
                  </Button>
                  <Button onClick={() => quickLogFeeding(150)} variant="outline" size="sm">
                    150ml
                  </Button>
                  <Button
                    onClick={() => quickLogFeeding(Number(quickFeedingAmount))}
                    className="flex-1"
                    disabled={!quickFeedingAmount}
                  >
                    Log {quickFeedingAmount}ml
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick Diaper - Wet */}
          <Button
            variant="outline"
            className="h-16 flex flex-col gap-1 bg-transparent"
            onClick={() => quickLogDiaper("wet")}
            disabled={isLogging}
          >
            <span className="text-lg">💧</span>
            <span className="text-xs">Wet Diaper</span>
          </Button>

          {/* Quick Diaper - Dirty */}
          <Button
            variant="outline"
            className="h-16 flex flex-col gap-1 bg-transparent"
            onClick={() => quickLogDiaper("dirty")}
            disabled={isLogging}
          >
            <span className="text-lg">💩</span>
            <span className="text-xs">Dirty Diaper</span>
          </Button>

          {/* Sleep Timer */}
          {!hasActiveSleep ? (
            <Button variant="outline" className="h-16 flex flex-col gap-1 bg-transparent" onClick={startSleepTimer}>
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-xs">Start Sleep</span>
            </Button>
          ) : (
            <Button
              variant="default"
              className="h-16 flex flex-col gap-1 bg-purple-600 hover:bg-purple-700"
              onClick={endSleepTimer}
            >
              <Clock className="h-5 w-5" />
              <span className="text-xs">End Sleep</span>
            </Button>
          )}
        </div>

        {isLogging && <div className="mt-3 text-center text-sm text-gray-600">Logging activity...</div>}
      </CardContent>
    </Card>
  )
}
