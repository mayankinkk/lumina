"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Flame, CheckCircle2 } from "lucide-react";
import useStore from "@/lib/store";

export function ReadingStats() {
  const sessions = useStore((s) => s.readingSessions);
  const books = useStore((s) => s.books);

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const completedBooks = books.filter((b) => b.status === "finished").length;
    const readingBooks = books.filter((b) => b.status === "reading").length;

    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter((s) => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    const uniqueDays = new Set(sessions.map((s) => s.date)).size;

    return {
      totalTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      todayTime: todayMinutes > 0 ? `${todayMinutes}m` : "0m",
      completedBooks,
      readingBooks,
      streak: uniqueDays,
    };
  }, [sessions, books]);

  return (
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
              <p className="text-sm font-medium">{stats.streak} days</p>
              <p className="text-xs text-muted-foreground">Days active</p>
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
        </div>
        {stats.todayTime !== "0m" && (
          <p className="mt-4 text-xs text-muted-foreground">Read {stats.todayTime} today</p>
        )}
      </CardContent>
    </Card>
  );
}
