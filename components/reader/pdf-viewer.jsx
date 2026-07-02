"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { PdfToolbar } from "./pdf-toolbar";
import { TxtViewer } from "./txt-viewer";
import { ContextMenuPopup } from "./context-menu";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

export function PdfViewer({ bookId }) {
  const { zoom, currentPage, setCurrentPage, setTotalPages, allBooks, loadFileData, updateBook, hydrated } = useStore(
    useShallow((s) => ({
      zoom: s.zoom,
      currentPage: s.currentPage,
      setCurrentPage: s.setCurrentPage,
      setTotalPages: s.setTotalPages,
      allBooks: s.books,
      loadFileData: s.loadFileData,
      updateBook: s.updateBook,
      hydrated: s._hydrated,
    }))
  );
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskIdRef = useRef(0);
  const activeRenderTaskRef = useRef(null); // holds the live pdfjs RenderTask for cancellation

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Timestamp bumped after PDF loads — guarantees render effect fires even if currentPage stays at 1
  const [pdfLoadedAt, setPdfLoadedAt] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  // Load PDF into memory
  useEffect(() => {
    if (!book || !hydrated) return;
    let cancelled = false;

    pdfDocRef.current = null;
    setPdfLoadedAt(null);
    setLoading(true);
    setError(null);

    async function loadPdf() {
      if (book.format === "txt") {
        if (!cancelled) { setTotalPages(1); setLoading(false); }
        return;
      }

      const fileData = loadFileData(bookId);
      if (!fileData) {
        if (!cancelled) {
          setError("File data not available. Please re-upload the file.");
          setLoading(false);
        }
        return;
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // Always produce an independent copy of the data before passing to pdfjs.
        // pdfjs transfers the ArrayBuffer to its web worker (neutering the original),
        // so we must never share the buffer reference from the fileCache.
        let bytes;
        if (fileData instanceof Uint8Array) {
          bytes = fileData.slice(0); // copies only the typed-array's own bytes
        } else if (fileData instanceof ArrayBuffer) {
          bytes = new Uint8Array(fileData.slice(0)); // .slice creates a new ArrayBuffer
        } else {
          bytes = new Uint8Array(fileData);
        }

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);

        // setCurrentPage may be a no-op if page is already 1 (store default).
        // Always set it so the page is correct, then bump pdfLoadedAt to
        // guarantee the render effect fires regardless.
        const targetPage = book.currentPage > 0 ? book.currentPage : 1;
        setCurrentPage(targetPage);
        setLoading(false);
        // Bump timestamp AFTER setLoading so render effect sees pdfDocRef populated
        setPdfLoadedAt(Date.now());
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) {
          setError(`Failed to load PDF: ${err?.message || "unknown error"}`);
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, hydrated]);

  // Render the current page onto the canvas
  useEffect(() => {
    if (!pdfDocRef.current || !pdfLoadedAt || currentPage < 1) return;

    // Cancel any in-flight pdfjs render before starting a new one
    if (activeRenderTaskRef.current) {
      try { activeRenderTaskRef.current.cancel(); } catch (_) {}
      activeRenderTaskRef.current = null;
    }

    const taskId = ++renderTaskIdRef.current;

    async function renderPage() {
      try {
        const pdf = pdfDocRef.current;
        if (!pdf) return;

        const page = await pdf.getPage(currentPage);
        if (taskId !== renderTaskIdRef.current) return;

        const scale = (zoom / 100) * 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({ canvasContext: ctx, viewport });
        activeRenderTaskRef.current = renderTask;
        await renderTask.promise;
        activeRenderTaskRef.current = null;

        if (taskId !== renderTaskIdRef.current) return;

        const freshBook = useStore.getState().books.find((b) => b.id === bookId);
        if (freshBook) {
          updateBook(bookId, {
            currentPage,
            progress: freshBook.totalPages > 0
              ? Math.round((currentPage / freshBook.totalPages) * 100)
              : 0,
            lastOpened: new Date().toISOString(),
          });
        }
      } catch (err) {
        // RenderingCancelledException is expected when we cancel — ignore it
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF render error:", err);
        }
      }
    }

    renderPage();
  }, [currentPage, zoom, pdfLoadedAt, bookId, updateBook]);

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

  useAutoScroll(containerRef, { isTxt: false });

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

      {/* Always keep canvas mounted so page turns don't cause a blank flash.
          Use visibility (not display:none) to preserve canvas dimensions. */}
      <div
        className="flex justify-center py-4 px-2"
        style={{ visibility: loading || error ? "hidden" : "visible" }}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full shadow-lg"
          role="img"
          aria-label={`Page ${currentPage} of ${book.totalPages}`}
        />
      </div>

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
