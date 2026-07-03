"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { PdfToolbar } from "./pdf-toolbar";
import { TxtViewer } from "./txt-viewer";
import { EpubViewer } from "./epub-viewer";
import { ComicViewer } from "./comic-viewer";
import { ContextMenuPopup } from "./context-menu";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { ReadingRuler } from "./reading-ruler";
import { BreakReminderModal } from "./break-reminder";

export function PdfViewer({ bookId }) {
  const { zoom, currentPage, totalPages, setCurrentPage, setTotalPages, allBooks, loadFileData, updateBook, hydrated } = useStore(
    useShallow((s) => ({
      zoom: s.zoom,
      currentPage: s.currentPage,
      totalPages: s.totalPages,
      setCurrentPage: s.setCurrentPage,
      setTotalPages: s.setTotalPages,
      allBooks: s.books,
      loadFileData: s.loadFileData,
      updateBook: s.updateBook,
      hydrated: s._hydrated,
    }))
  );
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);

  const pageAnimation = useStore((s) => s.pageAnimation);
  const pageAnimationSpeed = useStore((s) => s.pageAnimationSpeed);
  const blueLightFilter = useStore((s) => s.blueLightFilter);
  const readerTheme = useStore((s) => s.readerTheme);
  const readerBackground = useStore((s) => s.readerBackground);
  const customThemeColors = useStore((s) => s.customThemeColors);
  const dualPageMode = useStore((s) => s.dualPageMode);
  const searchQuery = useStore((s) => s.searchQuery);
  const searchResults = useStore((s) => s.searchResults);
  const searchCurrentIndex = useStore((s) => s.searchCurrentIndex);
  const setSearchResults = useStore((s) => s.setSearchResults);
  const setSearchCurrentIndex = useStore((s) => s.setSearchCurrentIndex);
  const bookOrientation = useStore((s) => s.bookOrientation);
  const currentOrientation = bookOrientation[bookId] || "auto";
  const orientationRef = useRef(currentOrientation);

  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskIdRef = useRef(0);
  const activeRenderTaskRef = useRef(null);
  const prevPageRef = useRef(currentPage);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoadedAt, setPdfLoadedAt] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [pageAnimClass, setPageAnimClass] = useState("");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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

        const scale = (zoom / 100) * 1.5;

        // Render left page
        const page = await pdf.getPage(currentPage);
        if (taskId !== renderTaskIdRef.current) return;

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

        // If dual page mode, render page 2 (currentPage+1) on the right canvas
        const dual = useStore.getState().dualPageMode;
        if (dual && canvasRef2.current && currentPage < pdf.numPages) {
          const page2 = await pdf.getPage(currentPage + 1);
          const vp2 = page2.getViewport({ scale });
          const c2 = canvasRef2.current;
          c2.width = vp2.width;
          c2.height = vp2.height;
          const ctx2 = c2.getContext("2d");
          ctx2.clearRect(0, 0, c2.width, c2.height);
          const rt2 = page2.render({ canvasContext: ctx2, viewport: vp2 });
          activeRenderTaskRef.current = rt2;
          await rt2.promise;
          activeRenderTaskRef.current = null;
          if (taskId !== renderTaskIdRef.current) return;
        } else if (canvasRef2.current) {
          const c2 = canvasRef2.current;
          const ctx2 = c2.getContext("2d");
          ctx2.clearRect(0, 0, c2.width || 1, c2.height || 1);
        }

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

  const handleClickZone = useCallback((e) => {
    if (selectedText) return;
    const state = useStore.getState();
    const dual = state.dualPageMode;
    const step = dual ? 2 : 1;
    const zones = state.tapZones;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    let position;
    if (x < third) {
      position = "left";
    } else if (x > rect.width - third) {
      position = "right";
    } else {
      position = "center";
    }

    const zone = zones.find((z) => z.position === position);
    if (!zone || zone.action === "none") return;

    switch (zone.action) {
      case "prevPage":
        if (currentPage > 1) setCurrentPage(Math.max(1, currentPage - step));
        break;
      case "nextPage":
        if (currentPage < totalPages) setCurrentPage(Math.min(totalPages, currentPage + step));
        break;
      case "bookmark":
        state.addBookmark({
          id: crypto.randomUUID(),
          bookId,
          page: currentPage,
          label: `Page ${currentPage}`,
          createdAt: new Date().toISOString(),
        });
        break;
      case "toc": {
        const tocBtn = document.querySelector("[data-toc-toggle]");
        tocBtn?.click();
        break;
      }
      case "search": {
        const searchInput = document.querySelector("[data-search-input]");
        if (searchInput) setTimeout(() => searchInput.focus(), 50);
        break;
      }
    }
  }, [currentPage, totalPages, setCurrentPage, selectedText, bookId]);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (selectedText) return;
    const state = useStore.getState();
    const dual = state.dualPageMode;
    const threshold = state.swipeThreshold;
    const step = dual ? 2 : 1;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && currentPage < totalPages) {
        setCurrentPage(Math.min(totalPages, currentPage + step));
      } else if (dx > 0 && currentPage > 1) {
        setCurrentPage(Math.max(1, currentPage - step));
      }
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const third = rect.width / 3;
      if (x < third && currentPage > 1) {
        setCurrentPage(Math.max(1, currentPage - step));
      } else if (x > rect.width - third && currentPage < totalPages) {
        setCurrentPage(Math.min(totalPages, currentPage + step));
      }
    }
  }, [currentPage, totalPages, setCurrentPage, selectedText]);

  const dismissContextMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedText("");
  }, []);

  useAutoScroll(containerRef, { isTxt: false });

  useEffect(() => {
    const pdf = pdfDocRef.current;
    if (!pdf || !searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setSearchCurrentIndex(-1);
      return;
    }

    let cancelled = false;

    async function doSearch() {
      const matches = [];
      const lowerQ = searchQuery.toLowerCase();

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) return;
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          for (const item of textContent.items) {
            const str = item.str;
            if (!str) continue;
            let idx = str.toLowerCase().indexOf(lowerQ);
            while (idx !== -1) {
              matches.push({ page: pageNum, text: str, index: idx, match: str.substring(idx, idx + searchQuery.length) });
              idx = str.toLowerCase().indexOf(lowerQ, idx + 1);
            }
          }
        } catch {}
      }

      if (!cancelled) {
        setSearchResults(matches);
        setSearchCurrentIndex(matches.length > 0 ? 0 : -1);
      }
    }

    doSearch();
    return () => { cancelled = true; };
  }, [searchQuery, pdfLoadedAt]);

  useEffect(() => {
    if (searchResults.length > 0 && searchCurrentIndex >= 0 && searchResults[searchCurrentIndex]?.page && searchResults[searchCurrentIndex].page !== currentPage) {
      setCurrentPage(searchResults[searchCurrentIndex].page);
    }
  }, [searchCurrentIndex, searchResults, currentPage, setCurrentPage]);

  useEffect(() => {
    orientationRef.current = currentOrientation;
    if (currentOrientation === "auto") return;
    if (typeof screen !== "undefined" && "orientation" in screen && screen.orientation?.lock) {
      screen.orientation.lock(currentOrientation).catch(() => {});
    }
  }, [currentOrientation]);

  useEffect(() => {
    if (!pdfLoadedAt || pageAnimation === "none") return;
    const prev = prevPageRef.current;
    prevPageRef.current = currentPage;
    const forward = currentPage > prev;
    let cls = "";
    if (pageAnimation === "slide") {
      cls = forward ? "animate-page-slide-forward" : "animate-page-slide-backward";
    } else if (pageAnimation === "fade") {
      cls = "animate-page-fade";
    } else if (pageAnimation === "flip") {
      cls = "animate-page-flip";
    } else if (pageAnimation === "curl") {
      cls = "animate-page-curl";
    }
    if (cls) {
      setPageAnimClass(cls);
      const timer = setTimeout(() => setPageAnimClass(""), pageAnimationSpeed);
      return () => clearTimeout(timer);
    }
  }, [currentPage, pageAnimation, pageAnimationSpeed, pdfLoadedAt]);

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

  if (book.format === "epub") {
    return <EpubViewer bookId={bookId} book={book} />;
  }

  if (book.format === "cbz") {
    return <ComicViewer bookId={bookId} book={book} />;
  }

  return (
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-auto ${readerTheme !== "default" && readerTheme !== "custom" ? `theme-${readerTheme}` : ""} ${readerBackground !== "default" ? `bg-${readerBackground}` : ""} ${currentOrientation === "landscape" ? "orientation-landscape" : currentOrientation === "portrait" ? "orientation-portrait" : ""}`}
      style={readerTheme === "custom" && customThemeColors ? {
        backgroundColor: customThemeColors.background,
        color: customThemeColors.text,
      } : undefined}
      onMouseUp={handleTextSelection}
      onClick={(e) => { dismissContextMenu(); handleClickZone(e); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

      <div className="fixed inset-0 pointer-events-none z-10" style={readerTheme === "custom" && customThemeColors ? { backgroundColor: customThemeColors.background, opacity: 0.92, mixBlendMode: "difference" } : undefined} />

      {/* Always keep canvas mounted so page turns don't cause a blank flash.
          Use visibility (not display:none) to preserve canvas dimensions. */}
      <div
        className={`flex justify-center py-4 px-2 ${pageAnimClass} animate-page-enter`}
        style={{ visibility: loading || error ? "hidden" : "visible", animationDuration: pageAnimation === "none" ? "0ms" : undefined }}
      >
        <div className={`flex ${dualPageMode ? "gap-2 flex-row" : ""} items-start justify-center`}>
          <canvas
            ref={canvasRef}
            className={`shadow-lg ${dualPageMode ? "w-[calc(50%-4px)]" : "max-w-full"}`}
            role="img"
            aria-label={`Page ${currentPage} of ${book.totalPages}`}
          />
          {dualPageMode && (
            <canvas
              ref={canvasRef2}
              className="shadow-lg w-[calc(50%-4px)]"
              role="img"
              aria-label={`Page ${currentPage + 1} of ${book.totalPages}`}
            />
          )}
        </div>
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

      <ReadingRuler containerRef={containerRef} />

      {blueLightFilter > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            backgroundColor: `rgba(255, 160, 60, ${blueLightFilter / 100})`,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
}

export { PdfToolbar };
