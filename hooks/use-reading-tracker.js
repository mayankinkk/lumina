"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

export function useReadingTracker(bookId) {
  const startTimeRef = useRef(null);
  const startPageRef = useRef(null);

  useEffect(() => {
    if (!bookId) return;

    const { books, updateBook, addReadingSession } = useStore.getState();
    const book = books.find((b) => b.id === bookId);

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
      const { books: latestBooks, addReadingSession: addSession } = useStore.getState();
      const endPage = latestBooks.find((b) => b.id === bookId)?.currentPage || 0;
      const pagesRead = Math.max(0, endPage - (startPageRef.current || 0));

      if (minutes >= 1 || pagesRead > 0) {
        addSession({
          id: crypto.randomUUID(),
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
