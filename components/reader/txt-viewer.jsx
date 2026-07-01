"use client";

import { useEffect } from "react";
import useStore from "@/lib/store";

export function TxtViewer({ bookId, book, zoom }) {
  const fileCache = useStore((s) => s.fileCache);
  const updateBook = useStore((s) => s.updateBook);
  const textContent = fileCache[bookId];

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
    <div className="flex justify-center py-8 px-4">
      <div
        className="reading-well font-literata text-foreground whitespace-pre-wrap leading-relaxed"
        style={{ fontSize: `${(zoom / 100) * 18}px` }}
      >
        {textContent}
      </div>
    </div>
  );
}
