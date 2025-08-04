"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, TrendingUp, Calendar, Calculator } from "lucide-react"
import Link from "next/link"
import { format, startOfWeek, endOfWeek, subDays, subWeeks } from "date-fns"

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

interface WeeklyStats {
  week: string
  feedings: number
  totalFormula: number
  diapers: number
  sleepHours: number
  avgFeedingAmount: number
}

interface MonthlyProjection {
  diapers: number
  formulaML: number
  formulaCans: number
  estimatedCost: number
}

export default function Reports() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [monthlyProjection, setMonthlyProjection] = useState<MonthlyProjection>({
    diapers: 0,
    formulaML: 0,
    formulaCans: 0,
    estimatedCost: 0,
  })

  useEffect(() => {
    const stored = localStorage.getItem("babyActivities")
    if (stored) {
      const parsedActivities = JSON.parse(stored)
      setActivities(parsedActivities)
      calculateWeeklyStats(parsedActivities)
      calculateMonthlyProjection(parsedActivities)
    }
  }, [])

  const calculateWeeklyStats = (activities: Activity[]) => {
    const weeks = []
    const now = new Date()

    // Get last 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(subWeeks(now, i))
      const weekEnd = endOfWeek(subWeeks(now, i))

      const weekActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= weekStart && activityDate <= weekEnd
      })

      const feedings = weekActivities.filter((a) => a.type === "feeding").length
      const totalFormula = weekActivities
        .filter((a) => a.type === "feeding")
        .reduce((sum, a) => sum + (a.amount || 0), 0)
      const diapers = weekActivities.filter((a) => a.type === "diaper").length

      const sleepActivities = weekActivities.filter((a) => a.type === "sleep")
      const sleepHours = sleepActivities.reduce((total, activity) => {
        if (activity.sleepStart && activity.sleepEnd) {
          const start = new Date(activity.sleepStart)
          const end = new Date(activity.sleepEnd)
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }
        return total
      }, 0)

      weeks.push({
        week: format(weekStart, "MMM d") + " - " + format(weekEnd, "MMM d"),
        feedings,
        totalFormula,
        diapers,
        sleepHours,
        avgFeedingAmount: feedings > 0 ? Math.round(totalFormula / feedings) : 0,
      })
    }

    setWeeklyStats(weeks.reverse())
  }

  const calculateMonthlyProjection = (activities: Activity[]) => {
    // Use last 7 days to project monthly needs
    const last7Days = activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp)
      const sevenDaysAgo = subDays(new Date(), 7)
      return activityDate >= sevenDaysAgo
    })

    const dailyDiapers = last7Days.filter((a) => a.type === "diaper").length / 7
    const dailyFormula = last7Days.filter((a) => a.type === "feeding").reduce((sum, a) => sum + (a.amount || 0), 0) / 7

    const monthlyDiapers = Math.ceil(dailyDiapers * 30)
    const monthlyFormulaML = Math.ceil(dailyFormula * 30)
    const monthlyFormulaCans = Math.ceil(monthlyFormulaML / 800) // Assuming 800ml per can

    // Rough cost estimates (adjust based on your local prices)
    const diaperCost = monthlyDiapers * 0.25 // $0.25 per diaper
    const formulaCost = monthlyFormulaCans * 15 // $15 per can
    const totalCost = diaperCost + formulaCost

    setMonthlyProjection({
      diapers: monthlyDiapers,
      formulaML: monthlyFormulaML,
      formulaCans: monthlyFormulaCans,
      estimatedCost: totalCost,
    })
  }

  const exportData = () => {
    const dataStr = JSON.stringify(activities, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `baby-tracker-data-${format(new Date(), "yyyy-MM-dd")}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-7 w-7 text-green-600" />
                Reports & Analytics
              </h1>
              <p className="text-gray-600">Track patterns and plan supplies</p>
            </div>
          </div>

          <Button onClick={exportData} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Planning</TabsTrigger>
            <TabsTrigger value="all-data">All Records</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Statistics
                </CardTitle>
                <CardDescription>Last 4 weeks of activity patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyStats.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No data available yet</p>
                ) : (
                  <div className="space-y-4">
                    {weeklyStats.map((week, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">{week.week}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{week.feedings}</div>
                            <div className="text-gray-600">Feedings</div>
                            <div className="text-xs text-gray-500">{week.totalFormula}ml total</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">{week.diapers}</div>
                            <div className="text-gray-600">Diapers</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">{week.sleepHours.toFixed(1)}h</div>
                            <div className="text-gray-600">Sleep</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{week.avgFeedingAmount}ml</div>
                            <div className="text-gray-600">Avg Feeding</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Monthly Supply Planning
                </CardTitle>
                <CardDescription>Projected needs based on recent usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Supply Needs</h3>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{monthlyProjection.diapers}</div>
                          <div className="text-sm text-gray-600">Diapers per month</div>
                        </div>
                        <div className="text-3xl">🍼</div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{monthlyProjection.formulaCans}</div>
                          <div className="text-sm text-gray-600">Formula cans per month</div>
                          <div className="text-xs text-gray-500">
                            ({monthlyProjection.formulaML.toLocaleString()}ml total)
                          </div>
                        </div>
                        <div className="text-3xl">🍼</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Cost Estimation</h3>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${monthlyProjection.estimatedCost.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Estimated monthly cost</div>
                        <div className="text-xs">• Diapers: ${(monthlyProjection.diapers * 0.25).toFixed(0)}</div>
                        <div className="text-xs">• Formula: ${(monthlyProjection.formulaCans * 15).toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                      <strong>Note:</strong> Estimates based on last 7 days of usage. Actual costs may vary by brand and
                      location.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Activity Records</CardTitle>
                <CardDescription>Complete history of all logged activities</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No activities recorded yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {activity.type === "feeding" && <span className="text-blue-600">🍼</span>}
                            {activity.type === "diaper" && <span>🍼</span>}
                            {activity.type === "sleep" && <span className="text-purple-600">😴</span>}

                            <div>
                              <div className="font-medium capitalize">{activity.type}</div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(activity.timestamp), "EEEE, MMM d, yyyy 'at' h:mm a")}
                              </div>
                              {activity.notes && <div className="text-xs text-gray-500 mt-1">{activity.notes}</div>}
                            </div>
                          </div>

                          <div className="text-right">
                            {activity.type === "feeding" && <Badge variant="secondary">{activity.amount}ml</Badge>}
                            {activity.type === "diaper" && <Badge variant="secondary">{activity.diaperType}</Badge>}
                            {activity.type === "sleep" && activity.sleepStart && activity.sleepEnd && (
                              <div className="text-right">
                                <Badge variant="secondary">
                                  {(
                                    (new Date(activity.sleepEnd).getTime() - new Date(activity.sleepStart).getTime()) /
                                    (1000 * 60 * 60)
                                  ).toFixed(1)}
                                  h
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">
                                  {format(new Date(activity.sleepStart), "h:mm a")} -{" "}
                                  {format(new Date(activity.sleepEnd), "h:mm a")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
