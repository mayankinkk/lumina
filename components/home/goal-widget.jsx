"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoalWidget() {
  const goal = 20;
  const read = 10;
  const percentage = Math.round((read / goal) * 100);
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today&apos;s Goal</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
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
            <span className="text-xl font-bold">{percentage}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {read} of {goal} pages read
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {goal - read} pages to go
          </p>
          <Button size="sm" className="mt-3" variant="outline">
            Update Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
