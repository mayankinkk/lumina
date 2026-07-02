"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, Clock, Bookmark } from "lucide-react";
import useStore from "@/lib/store";

export function GoalWidget() {
  const sessions = useStore((s) => s.readingSessions);
  const dailyGoal = useStore((s) => s.dailyGoal);
  const weeklyGoal = useStore((s) => s.weeklyGoal);
  const goalMode = useStore((s) => s.goalMode);
  const setDailyGoal = useStore((s) => s.setDailyGoal);
  const setWeeklyGoal = useStore((s) => s.setWeeklyGoal);
  const setGoalMode = useStore((s) => s.setGoalMode);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter((s) => s.date === today);
    const todayPages = todaySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const weekSessions = sessions.filter((s) => last7Days.includes(s.date));
    const weekPages = weekSessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const weekMinutes = weekSessions.reduce((sum, s) => sum + (s.minutes || 0), 0);

    return { todayPages, todayMinutes, weekPages, weekMinutes };
  }, [sessions]);

  const current = goalMode === "pages" ? stats.todayPages : stats.todayMinutes;
  const goal = goalMode === "pages" ? dailyGoal : weeklyGoal;
  const setGoal = goalMode === "pages" ? setDailyGoal : setWeeklyGoal;
  const step = goalMode === "pages" ? 5 : 10;
  const min = goalMode === "pages" ? 5 : 10;
  const max = goalMode === "pages" ? 100 : 300;
  const unit = goalMode === "pages" ? "pages" : "min";

  const percentage = Math.min(100, Math.round((current / goal) * 100));
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Reading Goal</CardTitle>
          <Tabs value={goalMode} onValueChange={(v) => setGoalMode(v)} className="h-6">
            <TabsList className="h-6">
              <TabsTrigger value="pages" className="h-5 text-[10px] px-2 gap-1"><Bookmark className="h-3 w-3" /> Pages</TabsTrigger>
              <TabsTrigger value="minutes" className="h-5 text-[10px] px-2 gap-1"><Clock className="h-3 w-3" /> Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${current} of ${goal} ${unit}`}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-green-600 dark:text-green-400" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{current}</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground">
            {current} of {goal} {unit} {goalMode === "pages" ? "today" : "this week"}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.max(0, goal - current)} {unit} to go
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setGoal(Math.max(min, goal - step))} aria-label={`Decrease ${unit} goal`}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium min-w-[50px] text-center">{goal} {unit}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setGoal(Math.min(max, goal + step))} aria-label={`Increase ${unit} goal`}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
