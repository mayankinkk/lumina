"use client";

import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadingTimer } from "@/hooks/use-reading-timer";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerControls() {
  const {
    running, remaining, isBreak,
    start, pause, reset, stop,
    duration, breakDuration, enabled,
  } = useReadingTimer();

  if (!enabled) return null;

  const totalSeconds = isBreak ? breakDuration * 60 : duration * 60;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-w-[200px] space-y-3 p-1">
      <div className="flex items-center justify-center gap-2">
        <Timer className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {isBreak ? "Break" : "Reading"}
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={isBreak ? "hsl(var(--warning))" : "hsl(var(--primary))"}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute text-lg font-mono font-bold tabular-nums">
          {formatTime(remaining)}
        </span>
      </div>

      {isBreak && (
        <p className="text-center text-xs text-muted-foreground">
          Break time — {breakDuration} min
        </p>
      )}

      <div className="flex items-center justify-center gap-1">
        {running ? (
          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={pause}>
            <Pause className="h-3.5 w-3.5" /> Pause
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={start}>
            <Play className="h-3.5 w-3.5" /> {remaining === duration * 60 || remaining === breakDuration * 60 ? "Start" : "Resume"}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
