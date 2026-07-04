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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(JSON.stringify(schedule).length > 0 ? schedule : null));
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
  if (startMin <= endMin) return minutes >= startMin && minutes < endMin;
  return minutes >= startMin || minutes < endMin;
}

function calculateSunTimes(latitude, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const hourAngle = Math.acos(
    Math.max(-1, Math.min(1, (Math.sin(-0.833 * Math.PI / 180) - Math.sin(latitude * Math.PI / 180) * Math.sin(decl * Math.PI / 180)) /
      (Math.cos(latitude * Math.PI / 180) * Math.cos(decl * Math.PI / 180))))
  );
  const sunriseMinutes = 720 - 4 * (latitude + decl * 0.0) - (hourAngle * 180 / Math.PI) * 4;
  const sunsetMinutes = 720 - 4 * (latitude + decl * 0.0) + (hourAngle * 180 / Math.PI) * 4;
  const toTime = (mins) => {
    const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
    const m = Math.round(((mins % 1440) + 1440) % 1440 % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  return { sunrise: toTime(sunriseMinutes), sunset: toTime(sunsetMinutes) };
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
      let start = schedule.start;
      let end = schedule.end;
      if (schedule.mode === "sunrise-sunset" && schedule.latitude != null) {
        const times = calculateSunTimes(schedule.latitude, new Date());
        start = times.sunset;
        end = times.sunrise;
      }
      const night = isNightTime(start, end);
      applyNightMode(night);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [schedule, applyNightMode]);

  const enableManual = useCallback((start, end) => {
    const sched = { start, end, enabled: true, mode: "manual" };
    saveSchedule(sched);
    setScheduleState(sched);
    applyNightMode(isNightTime(start, end));
  }, [applyNightMode]);

  const enableSunriseSunset = useCallback(() => {
    const apply = (lat) => {
      const sched = { start: "", end: "", enabled: true, mode: "sunrise-sunset", latitude: lat };
      saveSchedule(sched);
      setScheduleState(sched);
      const times = calculateSunTimes(lat, new Date());
      applyNightMode(isNightTime(times.sunset, times.sunrise));
    };
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => apply(pos.coords.latitude),
        () => apply(40.7)
      );
    } else {
      apply(40.7);
    }
  }, [applyNightMode]);

  const disable = useCallback(() => {
    clearSchedule();
    setScheduleState(null);
    applyNightMode(false);
  }, [applyNightMode]);

  return {
    schedule,
    set: enableManual,
    enableSunriseSunset,
    disable,
    isActive: !!schedule,
    sunTimes: schedule?.mode === "sunrise-sunset" && schedule?.latitude != null
      ? calculateSunTimes(schedule.latitude, new Date())
      : null,
  };
}
