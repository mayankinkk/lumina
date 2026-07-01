"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PdfToolbar, PdfViewer } from "@/components/reader/pdf-viewer";
import { useReadingTracker } from "@/hooks/use-reading-tracker";

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.id;

  useReadingTracker(bookId);

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
    </div>
  );
}
