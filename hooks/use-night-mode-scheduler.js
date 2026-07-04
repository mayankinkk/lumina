"use client";

import { useState, useEffect, useCallback } from "react";
import useStore from "@/lib/store";

const STORAGE_KEY = "lumina-night-mode-schedule";

export function getSchedule() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSchedule(schedule) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export function clearSchedule() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function isNightTime(start, end) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  if (startMin <= endMin) {
    return minutes >= startMin && minutes < endMin;
  }
  return minutes >= startMin || minutes < endMin;
}

export function useNightModeScheduler() {
  const setReaderTheme = useStore((s) => s.setReaderTheme);
  const setBlueLightFilter = useStore((s) => s.setBlueLightFilter);
  const [schedule, setScheduleState] = useState(null);

  useEffect(() => {
    setScheduleState(getSchedule());
  }, []);

  const applyNightMode = useCallback((enabled) => {
    if (enabled) {
      setReaderTheme("dark");
      setBlueLightFilter(40);
    } else {
      setReaderTheme("default");
      setBlueLightFilter(0);
    }
  }, [setReaderTheme, setBlueLightFilter]);

  useEffect(() => {
    if (!schedule) return;

    const check = () => {
      const night = isNightTime(schedule.start, schedule.end);
      applyNightMode(night);
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [schedule, applyNightMode]);

  const enable = useCallback((start, end) => {
    const sched = { start, end, enabled: true };
    saveSchedule(sched);
    setScheduleState(sched);
    applyNightMode(isNightTime(start, end));
  }, [applyNightMode]);

  const disable = useCallback(() => {
    clearSchedule();
    setScheduleState(null);
    applyNightMode(false);
  }, [applyNightMode]);

  return { schedule, set: enable, disable, isActive: !!schedule };
}