"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Baby, Milk, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { QuickActions } from "@/components/quick-actions"


interface Activity {
  id: string
  type: "feeding" | "diaper" | "sleep"
  timestamp: string
  amount?: number
  diaperType?: "wet" | "dirty" | "both"
  sleepStart?: string
  sleepEnd?: string
  notes?: string
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [todayStats, setTodayStats] = useState({
    feedings: 0,
    totalFormula: 0,
    diapers: 0,
    sleepHours: 0,
  })

  useEffect(() => {
    // Load activities from localStorage
    const stored = localStorage.getItem("babyActivities")
    if (stored) {
      const parsedActivities = JSON.parse(stored)
      setActivities(parsedActivities)
      calculateTodayStats(parsedActivities)
    }
  }, [])

  const calculateTodayStats = (activities: Activity[]) => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayActivities = activities.filter((activity) => activity.timestamp.startsWith(today))

    const feedings = todayActivities.filter((a) => a.type === "feeding").length
    const totalFormula = todayActivities
      .filter((a) => a.type === "feeding")
      .reduce((sum, a) => sum + (a.amount || 0), 0)
    const diapers = todayActivities.filter((a) => a.type === "diaper").length

    const sleepActivities = todayActivities.filter((a) => a.type === "sleep")
    const sleepHours = sleepActivities.reduce((total, activity) => {
      if (activity.sleepStart && activity.sleepEnd) {
        const start = new Date(activity.sleepStart)
        const end = new Date(activity.sleepEnd)
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }
      return total
    }, 0)

    setTodayStats({ feedings, totalFormula, diapers, sleepHours })
  }

  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Baby className="h-8 w-8 text-blue-600" />
            Baby Tracker
          </h1>
          <p className="text-gray-600">Track feeding, diapers, sleep & more</p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Milk className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{todayStats.feedings}</div>
              <div className="text-sm text-gray-600">Feedings</div>
              <div className="text-xs text-gray-500">{todayStats.totalFormula}ml total</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🍼</div>
              <div className="text-2xl font-bold">{todayStats.diapers}</div>
              <div className="text-sm text-gray-600">Diapers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{todayStats.sleepHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Sleep</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{activities.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/log-feeding">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Milk className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Log Feeding</h3>
                <p className="text-gray-600 text-sm">Record feeding time & amount</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/log-diaper">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🍼</div>
                <h3 className="font-semibold text-lg">Log Diaper</h3>
                <p className="text-gray-600 text-sm">Track diaper changes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/log-sleep">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Log Sleep</h3>
                <p className="text-gray-600 text-sm">Record sleep periods</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest 5 recorded activities</CardDescription>
            </div>
            <Link href="/reports">
              <Button variant="outline">View All Reports</Button>
            </Link>
            <Link href="/activity-log">
              <Button variant="outline">Activity Timeline</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Baby className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No activities recorded yet</p>
                <p className="text-sm">Start by logging your first activity!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === "feeding" && <Milk className="h-5 w-5 text-blue-600" />}
                      {activity.type === "diaper" && <span className="text-lg">🍼</span>}
                      {activity.type === "sleep" && <Clock className="h-5 w-5 text-purple-600" />}

                      <div>
                        <div className="font-medium capitalize">{activity.type}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(activity.timestamp), "EEEE, MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {activity.type === "feeding" && <Badge variant="secondary">{activity.amount}ml</Badge>}
                      {activity.type === "diaper" && <Badge variant="secondary">{activity.diaperType}</Badge>}
                      {activity.type === "sleep" && activity.sleepStart && activity.sleepEnd && (
                        <Badge variant="secondary">
                          {(
                            (new Date(activity.sleepEnd).getTime() - new Date(activity.sleepStart).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(1)}
                          h
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
