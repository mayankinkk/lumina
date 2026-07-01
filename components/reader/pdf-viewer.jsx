"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut, Search, Bookmark, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export function PdfToolbar({ bookId }) {
  const router = useRouter();
  const { zoom, setZoom, currentPage, totalPages } = useStore(
    useShallow((s) => ({ zoom: s.zoom, setZoom: s.setZoom, currentPage: s.currentPage, totalPages: s.totalPages }))
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const allBooks = useStore((s) => s.books);
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);

  const goBack = () => router.push("/library");

  return (
    <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{book?.title || "Document"}</p>
            <p className="text-xs text-muted-foreground">
              {currentPage} of {totalPages || "—"} pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom - 10)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs min-w-[48px] justify-center">
            {zoom}%
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(zoom + 10)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(100)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t px-3 py-2">
          <Input
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            autoFocus
          />
        </div>
      )}

      {book && (
        <div className="px-3 pb-2 lg:px-4">
          <Progress value={book.progress} className="h-0.5" />
        </div>
      )}
    </div>
  );
}

export function PdfViewer({ bookId }) {
  const { zoom, currentPage, setCurrentPage, setTotalPages } = useStore(
    useShallow((s) => ({ zoom: s.zoom, currentPage: s.currentPage, setCurrentPage: s.setCurrentPage, setTotalPages: s.setTotalPages }))
  );
  const allBooks = useStore((s) => s.books);
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);
  const [selectedText, setSelectedText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (book) {
      setTotalPages(book.totalPages);
      setCurrentPage(book.currentPage || 1);
    }
  }, [book, setTotalPages, setCurrentPage]);

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

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  const sampleText = `
    <h2 class="font-literata text-2xl font-bold mb-6">Chapter 1: The Surprising Power of Atomic Habits</h2>
    <p class="mb-4 font-literata text-lg leading-relaxed">The British Cycling team had operated in the shadows of professional cycling for nearly a century. The organization had purchased 10 racing bikes over the past decade, and every single one had been built by other teams. In fact, the performance was so underwhelming that one of the top bike manufacturers in the world refused to sell bikes to the team for fear that it would hurt sales.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">Then Dave Brailsford was hired. Brailsford had been hired to follow a strategy known as the <strong>"aggregation of marginal gains,"</strong> which was the recursive process of getting 1 percent better with every aspect of the process. The theory was that if you improved every area related to cycling by just 1 percent, then you would get a significant increase when you added them all together.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">Brailsford and his coaches began by making small adjustments you might expect from a professional cycling team. They redesigned the bike seats to make them more comfortable and rubbed alcohol on the tires for a better grip. They asked riders to wear electrically heated overshorts to maintain ideal muscle temperature while riding and used biofeedback sensors to monitor how each athlete responded to a particular workout.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">The team tested various fabrics in a wind tunnel and had their outdoor riders switch to indoor racing suits, which proved to be lighter and more aerodynamic. But Brailsford and his team did not stop there. They tested different types of massage gels to see which one led to the fastest muscle recovery. They hired a surgeon to teach each rider the best way to wash their hands to reduce the chances of catching a cold. They convinced the riders to experiment with different types of pillows and mattresses to improve their sleep quality.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">The team began tracking each rider's power output in detail and bought a fleet of caravans to ensure that the riders' nutrition was precisely calibrated. Brailsford even brought in a sports psychologist to help riders develop the mental toughness needed to win in those final, agonizing milliseconds of a race.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">Five years after Brailsford arrived, the results spoke for themselves. At the 2008 Beijing Games, the British cycling team dominated the road and track cycling events, winning an astounding 60 percent of the gold medals available. Four years later, at the London Olympics, the British once again dominated the cycling events. The team captured 70 percent of the gold medals and set nine Olympic records.</p>
    <p class="mb-4 font-literata text-lg leading-relaxed">It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Meanwhile, improving by 1 percent isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful in the long run.</p>
    <p class="font-literata text-lg leading-relaxed">Here's how the math works out: if you get 1 percent better each day for one year, you'll end up thirty-seven times better by the time you're done. Conversely, if you get 1 percent worse each day for one year, you'll decline nearly down to zero. What starts as a small win or a minor setback accumulates into something much more.</p>
  `;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto"
      onMouseUp={handleTextSelection}
      onClick={dismissContextMenu}
    >
      <div className="mx-auto py-8 px-4 lg:px-8" style={{ maxWidth: `${(zoom / 100) * 680}px` }}>
        <div className="reading-well">
          <div
            className="font-literata text-foreground"
            dangerouslySetInnerHTML={{ __html: sampleText }}
          />
        </div>
      </div>

      {contextMenu && (
        <div
          className="absolute z-50"
          style={{ left: contextMenu.x, top: contextMenu.y, transform: "translateX(-50%) translateY(-100%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuPopup text={selectedText} position={contextMenu} />
        </div>
      )}

      <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 rounded-full border bg-background/95 backdrop-blur px-2 py-1 shadow-lg">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-xs font-medium">
            {currentPage} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextPage} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContextMenuPopup({ text }) {
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const addVocabularyWord = useStore((s) => s.addVocabularyWord);

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
        meaning: "Definition pending...",
        pronunciation: "",
        example: text,
        synonyms: [],
        antonyms: [],
        etymology: "",
        nextReview: new Date(Date.now() + 86400000).toISOString(),
        tags: [],
        dateAdded: new Date().toISOString(),
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
          meaning: "Showing great attention to detail; very careful and precise.",
          partOfSpeech: "Adjective",
          pronunciation: "/məˈtɪkjələs/",
          synonyms: ["thorough", "careful", "precise"],
        });
      } else {
        setResponse({
          explanation: "This text discusses the concept of marginal gains — the idea that small, incremental improvements compound over time to produce remarkable results.",
        });
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [text, action]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl border bg-background p-6 shadow-xl animate-in slide-in-from-bottom duration-200 lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{action === "define" ? "Definition" : "AI Explanation"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : action === "define" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{response.word}</span>
              <span className="text-sm text-muted-foreground">{response.partOfSpeech}</span>
            </div>
            {response.pronunciation && (
              <p className="text-sm text-muted-foreground">{response.pronunciation}</p>
            )}
            <p className="text-sm">{response.meaning}</p>
            {response.synonyms?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Synonyms</p>
                <div className="flex flex-wrap gap-1">
                  {response.synonyms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
              <p className="text-sm">{response.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
