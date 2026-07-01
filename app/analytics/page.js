"use client";

import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAnalytics } from "@/lib/mock-data";
import { BookOpen, BookMarked, FileText, Clock, Flame, TrendingUp } from "lucide-react";

const statCards = [
  {
    label: "Total Books",
    value: mockAnalytics.totalBooks,
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Books Read",
    value: mockAnalytics.booksRead,
    icon: BookMarked,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    label: "Pages Read",
    value: mockAnalytics.totalPagesRead.toLocaleString(),
    icon: FileText,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    label: "Words Learned",
    value: mockAnalytics.totalWordsLearned,
    icon: TrendingUp,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    label: "Reading Streak",
    value: `${mockAnalytics.readingStreak} days`,
    icon: Flame,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    label: "Avg. Reading Time",
    value: `${mockAnalytics.averageReadingTime} min/day`,
    icon: Clock,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
];

export default function AnalyticsPage() {
  const maxMinutes = Math.max(...mockAnalytics.weeklyReading.map((d) => d.minutes));
  const maxPages = Math.max(...mockAnalytics.monthlyProgress.map((d) => d.pages));

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your reading statistics and progress
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {mockAnalytics.weeklyReading.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{day.minutes}m</span>
                    <div
                      className="w-full bg-primary rounded-t-md transition-all"
                      style={{ height: `${(day.minutes / maxMinutes) * 140}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {mockAnalytics.monthlyProgress.map((month) => (
                  <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{month.pages}</span>
                    <div
                      className="w-full bg-green-600 dark:bg-green-400 rounded-t-md transition-all"
                      style={{ height: `${(month.pages / maxPages) * 140}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ShellLayout>
  );
}
