"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

export function useReadingTracker(bookId) {
  const addReadingSession = useStore((s) => s.addReadingSession);
  const updateBook = useStore((s) => s.updateBook);
  const startTimeRef = useRef(null);
  const startPageRef = useRef(null);
  const book = useStore((s) => s.books.find((b) => b.id === bookId));

  useEffect(() => {
    if (!bookId) return;

    startTimeRef.current = Date.now();
    startPageRef.current = book?.currentPage || 0;

    updateBook(bookId, {
      lastOpened: new Date().toISOString(),
      status: book?.status === "want_to_read" ? "reading" : book?.status || "reading",
    });

    return () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const minutes = Math.round(elapsed / 60000);
      const endPage = useStore.getState().books.find((b) => b.id === bookId)?.currentPage || 0;
      const pagesRead = Math.max(0, endPage - (startPageRef.current || 0));

      if (minutes >= 1 || pagesRead > 0) {
        addReadingSession({
          id: Date.now().toString(),
          bookId,
          date: new Date().toISOString().slice(0, 10),
          minutes,
          pagesRead,
          startPage: startPageRef.current || 0,
          endPage,
        });
      }
    };
  }, [bookId]);
}
