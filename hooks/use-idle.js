"use client";

import { useState, useEffect, useRef } from "react";

export function useIdle(idleTimeout = 3000) {
  const [idle, setIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIdle(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIdle(true), idleTimeout);
    };

    const events = ["mousemove", "mousedown", "touchstart", "touchmove", "keydown", "scroll", "wheel"];
    events.forEach((event) => document.addEventListener(event, handleActivity, { passive: true }));

    timerRef.current = setTimeout(() => setIdle(true), idleTimeout);

    return () => {
      events.forEach((event) => document.removeEventListener(event, handleActivity));
      clearTimeout(timerRef.current);
    };
  }, [idleTimeout]);

  return { idle, lastActivity };
}
