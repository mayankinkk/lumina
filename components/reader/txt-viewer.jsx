"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

export function TxtViewer({ bookId, book, zoom }) {
  const fileCache = useStore((s) => s.fileCache);
  const updateBook = useStore((s) => s.updateBook);
  const textContent = fileCache[bookId];
  const containerRef = useRef(null);
  const readerTheme = useStore((s) => s.readerTheme);
  const readerBackground = useStore((s) => s.readerBackground);
  const fontSettings = useStore(useShallow((s) => ({
    readerFontFamily: s.readerFontFamily,
    readerFontSize: s.readerFontSize,
    readerLineHeight: s.readerLineHeight,
    readerLetterSpacing: s.readerLetterSpacing,
    readerFontWeight: s.readerFontWeight,
  })));

  useAutoScroll(containerRef, { isTxt: true });

  useEffect(() => {
    if (textContent && book) {
      updateBook(bookId, {
        status: book.status === "want_to_read" ? "reading" : book.status,
        lastOpened: new Date().toISOString(),
      });
    }
  }, [textContent, bookId, book, updateBook]);

  if (!textContent) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Text content not available. Please re-upload.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex-1 overflow-auto ${readerTheme !== "default" ? `theme-${readerTheme}` : ""} ${readerBackground !== "default" ? `bg-${readerBackground}` : ""}`}>
      <div className="flex justify-center py-8 px-4">
        <div
          className="reading-well text-foreground whitespace-pre-wrap"
          style={{
            fontFamily: fontSettings.readerFontFamily === "literata" ? "var(--font-literata), serif" : fontSettings.readerFontFamily === "sans" ? "var(--font-jakarta), sans-serif" : fontSettings.readerFontFamily === "serif" ? "Georgia, serif" : "ui-monospace, monospace",
            fontSize: `${(zoom / 100) * fontSettings.readerFontSize}px`,
            lineHeight: fontSettings.readerLineHeight,
            letterSpacing: `${fontSettings.readerLetterSpacing}px`,
            fontWeight: fontSettings.readerFontWeight,
          }}
        >
          {textContent}
        </div>
      </div>
    </div>
  );
}
