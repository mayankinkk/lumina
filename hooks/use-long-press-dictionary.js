"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

export function useLongPressDictionary(containerRef, enabled = true) {
  const timerRef = useRef(null);
  const startPos = useRef(null);

  useEffect(() => {
    if (!enabled || !containerRef?.current) return;
    const el = containerRef.current;

    const handleStart = (e) => {
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
      timerRef.current = setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (text && text.length > 0 && text.length < 100) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = el.getBoundingClientRect();
          useStore.getState()._showContextMenu?.(text, {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 8,
          });
        }
      }, 500);
    };

    const handleMove = (e) => {
      if (!startPos.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startPos.current.x);
      const dy = Math.abs(touch.clientY - startPos.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleEnd = () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      startPos.current = null;
    };

    el.addEventListener("touchstart", handleStart, { passive: true });
    el.addEventListener("touchmove", handleMove, { passive: true });
    el.addEventListener("touchend", handleEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleStart);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchend", handleEnd);
      clearTimeout(timerRef.current);
    };
  }, [containerRef, enabled]);
}
