"use client";

import { useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useStore from "@/lib/store";
import { BookOpen, BookMarked, FileText, Clock, Flame, TrendingUp } from "lucide-react";

function computeStats(books, vocabulary, sessions, highlights) {
  const totalBooks = books.length;
  const booksRead = books.filter((b) => b.status === "finished").length;
  const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  const wordsLearned = vocabulary.length;

  const now = new Date();
  let streak = 0;
  const dayMs = 86400000;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i < 365; i++) {
    const day = new Date(today.getTime() - i * dayMs);
    const dayStr = day.toISOString().slice(0, 10);
    const hasSession = sessions.some((s) => s.date === dayStr);
    if (hasSession || i === 0) {
      if (hasSession || i === 0) streak++;
    } else {
      break;
    }
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const daysWithSessions = new Set(sessions.map((s) => s.date)).size;
  const avgMinutes = daysWithSessions > 0 ? Math.round(totalMinutes / daysWithSessions) : 0;

  const weekAgo = new Date(today.getTime() - 6 * dayMs);
  const weeklyReading = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekAgo.getTime() + i * dayMs);
    const dayStr = day.toISOString().slice(0, 10);
    const minutes = sessions
      .filter((s) => s.date === dayStr)
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
    weeklyReading.push({ day: dayNames[day.getDay()], minutes });
  }

  const monthlyProgress = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const pages = sessions
      .filter((s) => s.date.startsWith(monthStr))
      .reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    monthlyProgress.push({ month: monthNames[d.getMonth()], pages });
  }

  return { totalBooks, booksRead, totalPagesRead, wordsLearned, streak, avgMinutes, weeklyReading, monthlyProgress };
}

const iconMap = {
  totalBooks: { icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  booksRead: { icon: BookMarked, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
  pagesRead: { icon: FileText, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  wordsLearned: { icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  streak: { icon: Flame, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
  avgMinutes: { icon: Clock, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
};

export default function AnalyticsPage() {
  const books = useStore((s) => s.books);
  const vocabulary = useStore((s) => s.vocabulary);
  const sessions = useStore((s) => s.readingSessions);
  const highlights = useStore((s) => s.highlights);

  const stats = useMemo(
    () => computeStats(books, vocabulary, sessions, highlights),
    [books, vocabulary, sessions, highlights]
  );

  const statCards = [
    { key: "totalBooks", label: "Total Books", value: stats.totalBooks },
    { key: "booksRead", label: "Finished", value: stats.booksRead },
    { key: "pagesRead", label: "Pages Read", value: stats.totalPagesRead.toLocaleString() },
    { key: "wordsLearned", label: "Words Saved", value: stats.wordsLearned },
    { key: "streak", label: "Reading Streak", value: `${stats.streak} days` },
    { key: "avgMinutes", label: "Avg. Daily", value: `${stats.avgMinutes} min` },
  ];

  const maxWeekly = Math.max(...stats.weeklyReading.map((d) => d.minutes), 1);
  const maxMonthly = Math.max(...stats.monthlyProgress.map((d) => d.pages), 1);

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your real reading statistics</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
          {statCards.map((stat) => {
            const meta = iconMap[stat.key];
            return (
              <Card key={stat.key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.bg}`}>
                      <meta.icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sessions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No reading data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Open a book and start reading to track your progress
              </p>
            </CardContent>
          </Card>
        )}

        {sessions.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {stats.weeklyReading.map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{d.minutes}m</span>
                      <div
                        className="w-full bg-primary rounded-t-md transition-all"
                        style={{ height: `${(d.minutes / maxWeekly) * 140}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {stats.monthlyProgress.map((m) => (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{m.pages}</span>
                      <div
                        className="w-full bg-green-600 dark:bg-green-400 rounded-t-md transition-all"
                        style={{ height: `${(m.pages / maxMonthly) * 140}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{m.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
