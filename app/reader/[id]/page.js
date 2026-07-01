"use client";

import ShellLayout from "@/components/layout/shell";
import { PdfToolbar, PdfViewer } from "@/components/reader/pdf-viewer";
import { useParams } from "next/navigation";

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.id;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PdfToolbar bookId={bookId} />
      <PdfViewer bookId={bookId} />
    </div>
  );
}
