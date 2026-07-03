"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

const LAST_NOTIF_KEY = "lumina_last_reading_notification";
const ENABLED_KEY = "lumina_reading_insights_enabled";
const HOUR_MS = 60 * 60 * 1000;

function getLastNotif() {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(LAST_NOTIF_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function setLastNotif() {
  try {
    localStorage.setItem(LAST_NOTIF_KEY, String(Date.now()));
  } catch {}
}

function isEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ENABLED_KEY) !== "false";
  } catch {
    return true;
  }
}

function canNotify() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  Notification.requestPermission();
  return false;
}

export function useReadingInsights() {
  const lastCountRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isEnabled() || !canNotify()) return;

    lastCountRef.current = useStore.getState().readingSessions.length;

    const unsub = useStore.subscribe((state) => {
      const count = state.readingSessions.length;
      if (count > lastCountRef.current) {
        const session = state.readingSessions[count - 1];
        if (session && Date.now() - getLastNotif() > HOUR_MS) {
          const mins = Math.round(session.minutes || 0);
          const pages = session.pagesRead || 0;
          new Notification("Session complete!", {
            body: `You read ${pages} page${pages !== 1 ? "s" : ""} in ${mins} minute${mins !== 1 ? "s" : ""}`,
          });
          setLastNotif();
        }
        lastCountRef.current = count;
      }
    });

    const check = () => {
      if (!isEnabled() || !canNotify()) return;
      if (Date.now() - getLastNotif() < HOUR_MS) return;

      const { readingSessions: sessions } = useStore.getState();
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const todaySessions = sessions.filter((s) => s.date === today);
      const hour = now.getHours();

      const sorted = [...sessions].sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );
      const last = sorted[0];

      if (last) {
        const daysSince = Math.floor(
          (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince >= 2) {
          new Notification("Lumina", {
            body: `You haven't read in ${daysSince} days. Pick up where you left off!`,
          });
          setLastNotif();
          return;
        }
      }

      if (hour >= 5 && hour < 12 && todaySessions.length > 0) {
        const totalMinutes = todaySessions.reduce((s, ses) => s + (ses.minutes || 0), 0);
        new Notification("Good morning!", {
          body: `Read for ${Math.round(totalMinutes)} minutes today`,
        });
        setLastNotif();
      }
    };

    check();
    intervalRef.current = setInterval(check, HOUR_MS);

    return () => {
      clearInterval(intervalRef.current);
      unsub();
    };
  }, []);
}
