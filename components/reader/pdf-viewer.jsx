"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export function PdfToolbar({ bookId }) {
  const router = useRouter();
  const { zoom, setZoom, currentPage, totalPages } = useStore(
    useShallow((s) => ({
      zoom: s.zoom,
      setZoom: s.setZoom,
      currentPage: s.currentPage,
      totalPages: s.totalPages,
    }))
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const allBooks = useStore((s) => s.books);
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);

  return (
    <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/library")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{book?.title || "Document"}</p>
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(zoom - 10)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs min-w-[48px] justify-center">
            {zoom}%
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(zoom + 10)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(100)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t px-3 py-2">
          <Input placeholder="Search in document..." className="max-w-sm" autoFocus />
        </div>
      )}

      {book && book.totalPages > 0 && (
        <div className="px-3 pb-2 lg:px-4">
          <Progress value={book.progress} className="h-0.5" />
        </div>
      )}
    </div>
  );
}

export function PdfViewer({ bookId }) {
  const {
    zoom,
    currentPage,
    setCurrentPage,
    setTotalPages,
  } = useStore(
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

  // Load PDF document
  useEffect(() => {
    if (!book) return;
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);

      const fileData = loadFileData(bookId);

      if (book.format === "txt") {
        if (!cancelled) {
          setTotalPages(1);
          setLoading(false);
        }
        return;
      }

      if (!fileData) {
        if (!cancelled) {
          setError("File data not available. Please re-upload the file.");
          setLoading(false);
        }
        return;
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setLoading(false);

        if (book.currentPage > 0) {
          setCurrentPage(book.currentPage);
        } else {
          setCurrentPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load PDF:", err);
          setError("Failed to load PDF file.");
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [bookId, book, loadFileData, setTotalPages, setCurrentPage]);

  // Render current page
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

        // Track progress
        if (!cancelled && book) {
          const newPage = currentPage;
          const newProgress = book.totalPages > 0
            ? Math.round((newPage / book.totalPages) * 100)
            : 0;
          updateBook(bookId, {
            currentPage: newPage,
            progress: newProgress,
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
    return (
      <TxtViewer bookId={bookId} book={book} zoom={zoom} />
    );
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
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          />
        </div>
      )}

      {contextMenu && (
        <div
          className="absolute z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            transform: "translateX(-50%) translateY(-100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuPopup text={selectedText} bookId={bookId} />
        </div>
      )}
    </div>
  );
}

function TxtViewer({ bookId, book, zoom }) {
  const fileCache = useStore((s) => s.fileCache);
  const updateBook = useStore((s) => s.updateBook);
  const textContent = fileCache[bookId];

  useEffect(() => {
    if (textContent && book) {
      updateBook(bookId, {
        progress: 100,
        currentPage: 1,
        status: book.status === "want_to_read" ? "reading" : book.status,
        lastOpened: new Date().toISOString(),
      });
    }
  }, [textContent, bookId, book, updateBook]);

  if (!textContent) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Text content not available. Please re-upload.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8 px-4">
      <div
        className="reading-well font-literata text-foreground whitespace-pre-wrap leading-relaxed"
        style={{ fontSize: `${(zoom / 100) * 18}px` }}
      >
        {textContent}
      </div>
    </div>
  );
}

function ContextMenuPopup({ text, bookId }) {
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const addVocabularyWord = useStore((s) => s.addVocabularyWord);
  const addHighlight = useStore((s) => s.addHighlight);
  const addNote = useStore((s) => s.addNote);

  const actions = [
    { label: "Define", icon: "📖", id: "define" },
    { label: "Explain", icon: "💡", id: "explain" },
    { label: "Translate", icon: "🌐", id: "translate" },
    { label: "Highlight", icon: "🖍️", id: "highlight" },
    { label: "Note", icon: "📝", id: "note" },
    { label: "Copy", icon: "📋", id: "copy" },
    { label: "Save", icon: "🔖", id: "save" },
  ];

  const handleAction = (actionId) => {
    if (actionId === "copy") {
      navigator.clipboard.writeText(text);
    }
    if (actionId === "save") {
      addVocabularyWord({
        id: Date.now().toString(),
        word: text,
        partOfSpeech: "Unknown",
        mastery: "B2",
        masteryLevel: 0,
        meaning: "",
        pronunciation: "",
        example: text,
        synonyms: [],
        antonyms: [],
        etymology: "",
        nextReview: new Date(Date.now() + 86400000).toISOString(),
        dateAdded: new Date().toISOString(),
      });
    }
    if (actionId === "highlight") {
      addHighlight({
        id: Date.now().toString(),
        bookId,
        text,
        color: "#fde047",
        page: useStore.getState().currentPage,
        createdAt: new Date().toISOString(),
      });
    }
    if (actionId === "note") {
      addNote({
        id: Date.now().toString(),
        bookId,
        bookTitle: useStore.getState().books.find((b) => b.id === bookId)?.title || "",
        text,
        highlight: "highlight-yellow",
        page: useStore.getState().currentPage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#fde047",
      });
    }
    if (actionId === "define" || actionId === "explain") {
      setActiveAction(actionId);
      setShowAiDrawer(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
        {actions.map((action) => (
          <button
            key={action.id}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent"
            onClick={() => handleAction(action.id)}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {showAiDrawer && (
        <AiDrawer
          text={text}
          action={activeAction}
          onClose={() => {
            setShowAiDrawer(false);
            setActiveAction(null);
          }}
        />
      )}
    </>
  );
}

function AiDrawer({ text, action, onClose }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (action === "define") {
        setResponse({
          word: text,
          meaning: "Definition will be available when AI is connected.",
          partOfSpeech: "—",
          pronunciation: "",
          synonyms: [],
        });
      } else {
        setResponse({
          explanation: "AI explanation will be available when connected to Gemini or OpenAI. Add your API key in .env.local.",
        });
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [text, action]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border bg-background p-6 shadow-xl animate-in slide-in-from-bottom duration-200 lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">
            {action === "define" ? "Definition" : "AI Explanation"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">{text}</p>
            <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground">{response.meaning || response.explanation}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Connect AI API in .env.local for real definitions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
