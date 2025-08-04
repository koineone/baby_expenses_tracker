"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Milk } from "lucide-react"
import Link from "next/link"
import { format, isToday, isYesterday } from "date-fns"

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

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    const stored = localStorage.getItem("babyActivities")
    if (stored) {
      setActivities(JSON.parse(stored))
    }
  }, [])

  const groupedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .reduce((groups: { [key: string]: Activity[] }, activity) => {
      const date = format(new Date(activity.timestamp), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {})

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "EEEE, MMMM d, yyyy")
  }

  const filteredActivities =
    selectedDate === "all" ? groupedActivities : { [selectedDate]: groupedActivities[selectedDate] || [] }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-7 w-7 text-blue-600" />
              Activity Timeline
            </h1>
            <p className="text-gray-600">Detailed day-by-day activity log</p>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDate === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate("all")}
              >
                All Days
              </Button>
              <Button
                variant={selectedDate === format(new Date(), "yyyy-MM-dd") ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
              >
                Today
              </Button>
              <Button
                variant={selectedDate === format(new Date(Date.now() - 86400000), "yyyy-MM-dd") ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(format(new Date(Date.now() - 86400000), "yyyy-MM-dd"))}
              >
                Yesterday
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <div className="space-y-6">
          {Object.keys(filteredActivities).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No activities recorded for the selected date</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(filteredActivities).map(([date, dayActivities]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {getDateLabel(date)}
                  </CardTitle>
                  <CardDescription>{dayActivities.length} activities recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dayActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Time Column */}
                        <div className="flex flex-col items-center min-w-[80px]">
                          <Clock className="h-4 w-4 text-gray-400 mb-1" />
                          <div className="text-sm font-medium">{format(new Date(activity.timestamp), "h:mm a")}</div>
                          <div className="text-xs text-gray-500">{format(new Date(activity.timestamp), "EEE")}</div>
                        </div>

                        {/* Activity Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === "feeding" && <Milk className="h-6 w-6 text-blue-600" />}
                          {activity.type === "diaper" && <span className="text-2xl">🍼</span>}
                          {activity.type === "sleep" && <span className="text-2xl">😴</span>}
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium capitalize">{activity.type}</h3>
                            {activity.type === "feeding" && activity.amount && (
                              <Badge variant="secondary">{activity.amount}ml</Badge>
                            )}
                            {activity.type === "diaper" && activity.diaperType && (
                              <Badge variant="secondary">{activity.diaperType}</Badge>
                            )}
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

                          {/* Sleep Duration Details */}
                          {activity.type === "sleep" && activity.sleepStart && activity.sleepEnd && (
                            <div className="text-sm text-gray-600 mb-2">
                              {format(new Date(activity.sleepStart), "h:mm a")} -{" "}
                              {format(new Date(activity.sleepEnd), "h:mm a")}
                            </div>
                          )}

                          {/* Notes */}
                          {activity.notes && (
                            <div className="text-sm text-gray-600 bg-white p-2 rounded border-l-2 border-blue-200">
                              {activity.notes}
                            </div>
                          )}
                        </div>

                        {/* Full Date/Time */}
                        <div className="text-xs text-gray-400 text-right min-w-[120px]">
                          <div>{format(new Date(activity.timestamp), "MMM d, yyyy")}</div>
                          <div>{format(new Date(activity.timestamp), "EEEE")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
