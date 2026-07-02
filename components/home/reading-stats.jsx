"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Flame, CheckCircle2, TrendingUp, Bookmark, ArrowRight } from "lucide-react";
import useStore from "@/lib/store";

export function ReadingStats() {
  const sessions = useStore((s) => s.readingSessions);
  const books = useStore((s) => s.books);

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const completedBooks = books.filter((b) => b.status === "finished").length;
    const readingBooks = books.filter((b) => b.status === "reading").length;

    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter((s) => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const todayPages = todaySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);

    const uniqueDays = new Set(sessions.map((s) => s.date)).size;

    const sortedDays = [...new Set(sessions.map((s) => s.date))].sort();
    let streak = 0;
    const todayDate = new Date();
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const d = new Date(sortedDays[i] + "T00:00:00");
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - (sortedDays.length - 1 - i));
      if (d.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10)) {
        streak++;
      } else break;
    }

    const avgMinutesPerSession = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;
    const avgPagesPerMinute = totalMinutes > 0 ? (totalPagesRead / totalMinutes).toFixed(1) : "0";

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const daySessions = sessions.filter((s) => s.date === key);
      return { date: key, minutes: daySessions.reduce((sum, s) => sum + (s.minutes || 0), 0) };
    }).reverse();

    const weeklyMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);

    return {
      totalTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      todayTime: todayMinutes,
      todayPages,
      completedBooks,
      readingBooks,
      streak,
      totalPagesRead,
      avgMinutesPerSession,
      avgPagesPerMinute,
      weeklyMinutes,
      last7Days,
    };
  }, [sessions, books]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reading Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.totalTime}</p>
                <p className="text-xs text-muted-foreground">Total read time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.completedBooks}</p>
                <p className="text-xs text-muted-foreground">Books finished</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.streak} day streak</p>
                <p className="text-xs text-muted-foreground">Current streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.readingBooks}</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Bookmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.totalPagesRead.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pages read</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.avgPagesPerMinute} pg/min</p>
                <p className="text-xs text-muted-foreground">Reading speed</p>
              </div>
            </div>
          </div>
          {stats.todayTime > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Read {stats.todayTime}m today{stats.todayPages > 0 ? ` (${stats.todayPages} pages)` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-20">
            {stats.last7Days.map((d) => {
              const maxMin = Math.max(...stats.last7Days.map((x) => x.minutes), 1);
              const height = Math.max(8, (d.minutes / maxMin) * 100);
              const isToday = d.date === new Date().toISOString().slice(0, 10);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${isToday ? "bg-primary" : "bg-primary/40"}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            {stats.weeklyMinutes}m this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
