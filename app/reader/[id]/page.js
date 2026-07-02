"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PdfToolbar, PdfViewer } from "@/components/reader/pdf-viewer";
import { useReadingTracker } from "@/hooks/use-reading-tracker";
import { BreakReminderModal } from "@/components/reader/break-reminder";
import useStore from "@/lib/store";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id;

  useReadingTracker(bookId);

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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PdfToolbar bookId={bookId} />
      <PdfViewer bookId={bookId} />
      <BreakReminderModal />
    </div>
  );
}
