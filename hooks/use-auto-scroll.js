"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

const LINE_HEIGHT = 24;
const PAGE_INTERVAL_BASE = 4000;

export function useAutoScroll(containerRef, { isTxt = false } = {}) {
  const mode = useStore((s) => s.autoScrollMode);
  const speed = useStore((s) => s.autoScrollSpeed);
  const currentPage = useStore((s) => s.currentPage);
  const totalPages = useStore((s) => s.totalPages);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const frameRef = useRef(null);
  const pageTimerRef = useRef(null);

  useEffect(() => {
    if (mode === "off" || !containerRef.current) return;

    const container = containerRef.current;

    if (mode === "page") {
      const interval = Math.max(1000, PAGE_INTERVAL_BASE - speed * 300);
      pageTimerRef.current = setInterval(() => {
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        }
      }, interval);
      return () => clearInterval(pageTimerRef.current);
    }

    const pixelSpeed = speed * 0.5;
    const lineSpeed = speed * 0.8;

    let lastTime = 0;

    function scrollFrame(time) {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      let amount = 0;
      if (mode === "rolling") {
        amount = pixelSpeed * (delta / 16);
      } else if (mode === "pixel") {
        amount = (pixelSpeed / 4) * (delta / 16);
      } else if (mode === "line") {
        amount = lineSpeed * (LINE_HEIGHT / 60) * (delta / 16);
      }

      const maxScroll = container.scrollHeight - container.clientHeight;
      const newTop = Math.min(container.scrollTop + amount, maxScroll);
      container.scrollTop = newTop;

      if (newTop >= maxScroll && totalPages > 1 && currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        container.scrollTop = 0;
      }

      frameRef.current = requestAnimationFrame(scrollFrame);
    }

    frameRef.current = requestAnimationFrame(scrollFrame);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mode, speed, currentPage, totalPages, setCurrentPage, containerRef]);

  return null;
}
