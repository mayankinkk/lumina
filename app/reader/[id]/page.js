"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PdfToolbar, PdfViewer } from "@/components/reader/pdf-viewer";
import { useReadingTracker } from "@/hooks/use-reading-tracker";
import { BreakReminderModal } from "@/components/reader/break-reminder";
import { useToast } from "@/components/toast";
import { useIdle } from "@/hooks/use-idle";
import useStore from "@/lib/store";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id;

  useReadingTracker(bookId);

  const { toast } = useToast();
  const book = useStore((s) => s.books.find((b) => b.id === bookId));
  const getNextInQueue = useStore((s) => s.getNextInQueue);
  const removeFromReadingQueue = useStore((s) => s.removeFromReadingQueue);
  const prevStatusRef = useRef(book?.status);

  const status = book?.status;

  useEffect(() => {
    if (!status) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev !== "finished" && status === "finished") {
      const nextId = getNextInQueue(bookId);
      if (nextId) {
        removeFromReadingQueue(bookId);
        toast(`Opening next book in queue...`, "success");
        const timer = setTimeout(() => {
          router.push(`/reader/${nextId}`);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [status, bookId, getNextInQueue, removeFromReadingQueue, router, toast]);

  useEffect(() => {
    const handler = (e) => {
      const { currentPage, totalPages, setCurrentPage, setZoom, zoom, readingRuler, setReadingRuler, autoScrollMode, setAutoScrollMode } = useStore.getState();

      if (e.key === "ArrowLeft" && currentPage > 1) {
        e.preventDefault();
        setCurrentPage(currentPage - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        e.preventDefault();
        setCurrentPage(currentPage + 1);
      } else if (e.key === "ArrowUp" && currentPage > 1) {
        e.preventDefault();
        setCurrentPage(currentPage - 1);
      } else if (e.key === "ArrowDown" && currentPage < totalPages) {
        e.preventDefault();
        setCurrentPage(currentPage + 1);
      } else if (e.key === "PageUp" && currentPage > 1) {
        e.preventDefault();
        setCurrentPage(Math.max(1, currentPage - 1));
      } else if (e.key === "PageDown" && currentPage < totalPages) {
        e.preventDefault();
        setCurrentPage(Math.min(totalPages, currentPage + 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentPage(1);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentPage(totalPages);
      } else if (e.key === " " || e.key === "Space") {
        e.preventDefault();
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
      } else if (e.key === "r" || e.key === "R") {
        setReadingRuler(!readingRuler);
      } else if (e.key === "a" || e.key === "A") {
        setAutoScrollMode(autoScrollMode === "off" ? "rolling" : "off");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoom(zoom + 10);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom(zoom - 10);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(100);
      } else if (e.key === "Escape") {
        router.push("/library");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const { idle } = useIdle(3000);
  const autoHideToolbar = useStore((s) => s.autoHideToolbar);
  const toolbarHidden = autoHideToolbar && idle;

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden transition-all duration-300 ${toolbarHidden ? "pt-0" : ""}`}
    >
      <div
        className={`transition-all duration-300 ${toolbarHidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      >
        <PdfToolbar bookId={bookId} />
      </div>
      <PdfViewer bookId={bookId} />
      <BreakReminderModal />
    </div>
  );
}
