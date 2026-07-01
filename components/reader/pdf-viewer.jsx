"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { PdfToolbar } from "./pdf-toolbar";
import { TxtViewer } from "./txt-viewer";
import { ContextMenuPopup } from "./context-menu";

export function PdfViewer({ bookId }) {
  const { zoom, currentPage, setCurrentPage, setTotalPages } = useStore(
    useShallow((s) => ({
      zoom: s.zoom,
      currentPage: s.currentPage,
      setCurrentPage: s.setCurrentPage,
      setTotalPages: s.setTotalPages,
    }))
  );
  const allBooks = useStore((s) => s.books);
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);
  const loadFileData = useStore((s) => s.loadFileData);
  const updateBook = useStore((s) => s.updateBook);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (!book) return;
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      const fileData = loadFileData(bookId);

      if (book.format === "txt") {
        if (!cancelled) { setTotalPages(1); setLoading(false); }
        return;
      }

      if (!fileData) {
        if (!cancelled) { setError("File data not available. Please re-upload the file."); setLoading(false); }
        return;
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setLoading(false);
        setCurrentPage(book.currentPage > 0 ? book.currentPage : 1);
      } catch (err) {
        if (!cancelled) { setError("Failed to load PDF file."); setLoading(false); }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [bookId, book, loadFileData, setTotalPages, setCurrentPage]);

  useEffect(() => {
    if (!pdfDocRef.current || loading || currentPage < 1) return;
    let cancelled = false;

    async function renderPage() {
      if (renderingRef.current) return;
      renderingRef.current = true;
      try {
        const pdf = pdfDocRef.current;
        if (!pdf || cancelled) return;
        const page = await pdf.getPage(currentPage);
        if (cancelled) return;
        const scale = (zoom / 100) * 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled && book) {
          updateBook(bookId, {
            currentPage,
            progress: book.totalPages > 0 ? Math.round((currentPage / book.totalPages) * 100) : 0,
            lastOpened: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Render error:", err);
      } finally {
        renderingRef.current = false;
      }
    }
    renderPage();
  }, [currentPage, zoom, loading, bookId, book, updateBook]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      setSelectedText(text);
      setContextMenu({
        x: rect.left - (containerRect?.left || 0) + rect.width / 2,
        y: rect.top - (containerRect?.top || 0) - 8,
      });
    } else {
      setSelectedText("");
      setContextMenu(null);
    }
  }, []);

  const dismissContextMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedText("");
  }, []);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  if (book.format === "txt") {
    return <TxtViewer bookId={bookId} book={book} zoom={zoom} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto"
      onMouseUp={handleTextSelection}
      onClick={dismissContextMenu}
    >
      {loading && (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex justify-center py-4 px-2">
          <canvas
            ref={canvasRef}
            className="max-w-full shadow-lg"
            role="img"
            aria-label={`Page ${currentPage} of ${book.totalPages}`}
          />
        </div>
      )}

      {contextMenu && (
        <div
          className="absolute z-50"
          style={{ left: contextMenu.x, top: contextMenu.y, transform: "translateX(-50%) translateY(-100%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuPopup text={selectedText} bookId={bookId} />
        </div>
      )}
    </div>
  );
}

export { PdfToolbar };
