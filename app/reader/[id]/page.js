"use client";

import { useParams } from "next/navigation";
import { PdfToolbar, PdfViewer } from "@/components/reader/pdf-viewer";
import { useReadingTracker } from "@/hooks/use-reading-tracker";

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.id;

  useReadingTracker(bookId);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PdfToolbar bookId={bookId} />
      <PdfViewer bookId={bookId} />
    </div>
  );
}
