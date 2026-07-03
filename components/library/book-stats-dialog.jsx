"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, Hash, Calendar, BarChart3 } from "lucide-react";
import useStore from "@/lib/store";
import { cn } from "@/lib/utils";

export function BookStatsDialog({ bookId, open, onOpenChange }) {
  const allSessions = useStore((s) => s.readingSessions);

  const stats = useMemo(() => {
    const sessions = allSessions.filter((s) => s.bookId === bookId);
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const dates = sessions.map((s) => s.date).filter(Boolean).sort();
    const lastRead = dates.length > 0 ? dates[dates.length - 1] : null;
    const avgPagesPerSession = totalSessions > 0 ? Math.round(totalPagesRead / totalSessions) : 0;
    const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    return { totalSessions, totalMinutes, totalPagesRead, lastRead, avgPagesPerSession, avgMinutesPerSession };
  }, [allSessions, bookId]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const items = [
    { icon: Clock, label: "Total reading time", value: formatTime(stats.totalMinutes), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { icon: Hash, label: "Number of sessions", value: stats.totalSessions, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
    { icon: BookOpen, label: "Total pages read", value: stats.totalPagesRead, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { icon: BarChart3, label: "Avg time per session", value: formatTime(stats.avgMinutesPerSession), color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30" },
    { icon: Calendar, label: "Last read", value: formatDate(stats.lastRead), color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reading Statistics</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", item.bg)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
