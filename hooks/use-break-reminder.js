"use client";

import { useEffect, useRef, useState } from "react";
import useStore from "@/lib/store";

const STORAGE_KEY = "lumina_eye_health";

function loadPrefs() {
  if (typeof window === "undefined") return { enabled: false, interval: 20 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { enabled: false, interval: 20 };
  } catch {
    return { enabled: false, interval: 20 };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function useBreakReminder() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [showReminder, setShowReminder] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const updatePrefs = (updates) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    savePrefs(next);
  };

  useEffect(() => {
    if (!prefs.enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowReminder(false);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setShowReminder(true);
      startTimeRef.current = Date.now();
    }, prefs.interval * 60 * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefs.enabled, prefs.interval]);

  const dismissReminder = () => {
    setShowReminder(false);
    if (prefs.enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setShowReminder(true);
      }, prefs.interval * 60 * 1000);
    }
  };

  return {
    prefs,
    updatePrefs,
    showReminder,
    dismissReminder,
  };
}
