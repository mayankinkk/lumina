"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useStore from "@/lib/store";

export function useReadingTimer() {
  const { readingTimer, setReadingTimer } = useStore(
    (s) => ({ readingTimer: s.readingTimer, setReadingTimer: s.setReadingTimer })
  );

  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(readingTimer.duration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);
  const isBreakRef = useRef(false);
  const runningRef = useRef(false);

  const notify = useCallback((title, body) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!readingTimer.enabled) {
      clearTick();
      setRunning(false);
      runningRef.current = false;
    }
  }, [readingTimer.enabled, clearTick]);

  useEffect(() => {
    if (!running) {
      clearTick();
      return;
    }
    runningRef.current = true;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          const breakMode = isBreakRef.current;
          if (breakMode) {
            isBreakRef.current = false;
            setIsBreak(false);
            const secs = readingTimer.duration * 60;
            notify("Break over!", "Time to get back to reading.");
            return secs;
          } else {
            isBreakRef.current = true;
            setIsBreak(true);
            const secs = readingTimer.breakDuration * 60;
            notify("Time for a break!", "Take a short break and rest your eyes.");
            return secs;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return clearTick;
  }, [running, readingTimer.duration, readingTimer.breakDuration, clearTick, notify]);

  const start = useCallback(() => {
    if (!readingTimer.enabled) return;
    clearTick();
    setRunning(true);
    runningRef.current = true;
    setReadingTimer({ running: true });
  }, [readingTimer.enabled, clearTick, setReadingTimer]);

  const pause = useCallback(() => {
    clearTick();
    setRunning(false);
    runningRef.current = false;
    setReadingTimer({ running: false });
  }, [clearTick, setReadingTimer]);

  const reset = useCallback(() => {
    clearTick();
    setRunning(false);
    runningRef.current = false;
    isBreakRef.current = false;
    setIsBreak(false);
    const secs = readingTimer.duration * 60;
    setRemaining(secs);
    setReadingTimer({ remaining: secs, isBreak: false, running: false });
  }, [clearTick, readingTimer.duration, setReadingTimer]);

  const stop = useCallback(() => {
    clearTick();
    setRunning(false);
    runningRef.current = false;
    isBreakRef.current = false;
    setIsBreak(false);
    const secs = readingTimer.duration * 60;
    setRemaining(secs);
    setReadingTimer({ remaining: secs, isBreak: false, running: false });
  }, [clearTick, readingTimer.duration, setReadingTimer]);

  return {
    running,
    remaining,
    isBreak,
    start,
    pause,
    reset,
    stop,
    duration: readingTimer.duration,
    breakDuration: readingTimer.breakDuration,
    enabled: readingTimer.enabled,
  };
}
