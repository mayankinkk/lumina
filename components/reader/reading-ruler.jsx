"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useStore from "@/lib/store";

const rulerThemes = [
  { top: "rgba(0,0,0,0.35)", bottom: "rgba(0,0,0,0.35)", bar: "rgba(255,255,255,0.08)" },
  { top: "rgba(0,0,0,0.4)", bottom: "rgba(0,0,0,0.4)", bar: "rgba(255,215,0,0.06)" },
  { top: "rgba(0,0,0,0.3)", bottom: "rgba(0,0,0,0.3)", bar: "linear-gradient(180deg, transparent, rgba(100,149,237,0.08), transparent)" },
  { top: "rgba(0,0,0,0.45)", bottom: "rgba(0,0,0,0.45)", bar: "rgba(255,255,255,0.1)" },
  { top: "rgba(0,0,0,0.25)", bottom: "rgba(0,0,0,0.25)", bar: "rgba(144,238,144,0.06)" },
  { top: "rgba(0,0,0,0.5)", bottom: "rgba(0,0,0,0.5)", bar: "rgba(255,255,255,0.05)" },
];

export function ReadingRuler({ containerRef }) {
  const readingRuler = useStore((s) => s.readingRuler);
  const readingRulerStyle = useStore((s) => s.readingRulerStyle);
  const [pos, setPos] = useState(null);
  const barRef = useRef(null);
  const themeIndex = parseInt(readingRulerStyle.replace("style", "")) || 0;

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !readingRuler) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      y: e.clientY - rect.top,
      x: e.clientX - rect.left,
    });
  }, [containerRef, readingRuler]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !readingRuler) {
      setPos(null);
      return;
    }
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef, readingRuler, handleMouseMove]);

  if (!readingRuler || !pos) return null;

  const barHeight = 48;
  const theme = rulerThemes[themeIndex % rulerThemes.length];

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{
          top: 0,
          height: Math.max(0, pos.y - barHeight / 2),
          background: theme.top,
        }}
      />
      <div
        ref={barRef}
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{
          top: pos.y - barHeight / 2,
          height: barHeight,
          background: theme.bar,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{
          top: pos.y + barHeight / 2,
          bottom: 0,
          background: theme.bottom,
        }}
      />
    </>
  );
}
