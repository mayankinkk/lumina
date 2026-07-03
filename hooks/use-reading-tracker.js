"use client";

import { useEffect, useRef } from "react";
import useStore from "@/lib/store";

export function useReadingTracker(bookId) {
  const accumulatedSecondsRef = useRef(0);
  const pagesReadRef = useRef(0);
  const prevPageRef = useRef(null);
  const startPageRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!bookId) return;

    const { books, updateBook, addReadingSession } = useStore.getState();
    const book = books.find((b) => b.id === bookId);

    const startPage = book?.currentPage || 1;
    startPageRef.current = startPage;
    prevPageRef.current = startPage;
    accumulatedSecondsRef.current = 0;
    pagesReadRef.current = 0;

    updateBook(bookId, {
      lastOpened: new Date().toISOString(),
      status: book?.status === "want_to_read" ? "reading" : book?.status || "reading",
    });

    intervalRef.current = setInterval(() => {
      accumulatedSecondsRef.current += 30;
    }, 30000);

    const unsub = useStore.subscribe((state) => {
      const newPage = state.currentPage;
      const prevPage = prevPageRef.current;
      if (newPage !== prevPage) {
        if (newPage > prevPage) {
          pagesReadRef.current += newPage - prevPage;
        }
        prevPageRef.current = newPage;
      }
    });

    return () => {
      clearInterval(intervalRef.current);
      unsub();

      const minutes = accumulatedSecondsRef.current / 60;
      const pagesRead = pagesReadRef.current;

      if (minutes > 0 || pagesRead > 0) {
        addReadingSession({
          id: crypto.randomUUID(),
          bookId,
          date: new Date().toISOString().slice(0, 10),
          minutes: Math.round(minutes * 10) / 10,
          pagesRead,
          startPage: startPageRef.current,
          endPage: useStore.getState().currentPage,
        });
      }
    };
  }, [bookId]);
}
