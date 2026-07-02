"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useStore from "@/lib/store";
import { Loader2 } from "lucide-react";

export function EpubViewer({ bookId, book }) {
  const loadFileData = useStore((s) => s.loadFileData);
  const updateBook = useStore((s) => s.updateBook);
  const currentPage = useStore((s) => s.currentPage);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const setTotalPages = useStore((s) => s.setTotalPages);
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const touchStartX = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book || !bookId) return;
    let cancelled = false;

    async function loadEpub() {
      setLoading(true);
      setError(null);

      const fileData = loadFileData(bookId);
      if (!fileData) {
        setError("File data not available. Please re-upload.");
        setLoading(false);
        return;
      }

      try {
        const epubjs = await import("epubjs");
        const blob = new Blob([fileData], { type: "application/epub+zip" });
        const url = URL.createObjectURL(blob);

        const book = epubjs.default ? new epubjs.default(url) : new epubjs(url);
        bookRef.current = book;

        await book.ready;

        if (cancelled) { URL.revokeObjectURL(url); return; }

        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated",
        });
        renditionRef.current = rendition;

        const total = book.spine?.length || 1;
        setTotalPages(total);

        const target = book.currentPage > 0 ? book.currentPage - 1 : 0;
        await rendition.display(target);

        rendition.on("relocated", (location) => {
          if (location?.start?.index !== undefined) {
            setCurrentPage(location.start.index + 1);
          }
        });

        updateBook(bookId, {
          status: book.status === "want_to_read" ? "reading" : book.status,
          lastOpened: new Date().toISOString(),
          totalPages: total,
        });

        setLoading(false);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("EPUB load error:", err);
        if (!cancelled) {
          setError(`Failed to load EPUB: ${err?.message || "unknown error"}`);
          setLoading(false);
        }
      }
    }

    loadEpub();
    return () => { cancelled = true; if (renditionRef.current) renditionRef.current.destroy(); if (bookRef.current) bookRef.current.destroy(); };
  }, [bookId, book]);

  const handleKeyDown = useCallback((e) => {
    const rendition = renditionRef.current;
    if (!rendition) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      rendition.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      rendition.prev();
    }
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    el.addEventListener("keydown", handleKeyDown);
    el.setAttribute("tabindex", "0");
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const rendition = renditionRef.current;
    if (!rendition) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -30) rendition.next();
    else if (dx > 30) rendition.prev();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className="relative flex-1 overflow-hidden bg-white dark:bg-[#1a1a1a]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: "60vh" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
