"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import useStore from "@/lib/store";

export function GoalWidget() {
  const sessions = useStore((s) => s.readingSessions);
  const [goal, setGoal] = useState(20);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter((s) => s.date === today);
    return todaySessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
  }, [sessions]);

  const percentage = Math.min(100, Math.round((todayStats / goal) * 100));
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today&apos;s Goal</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`${todayStats} of ${goal} pages read`}>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-green-600 dark:text-green-400"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{todayStats}</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted-foreground">
            {todayStats} of {goal} pages today
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.max(0, goal - todayStats)} pages to go
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGoal((g) => Math.max(5, g - 5))}
              aria-label="Decrease daily goal"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium min-w-[40px] text-center">{goal} pages</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGoal((g) => Math.min(100, g + 5))}
              aria-label="Increase daily goal"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
