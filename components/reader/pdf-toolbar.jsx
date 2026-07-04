"use client";

import { useMemo, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut, Search, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight, Play, Pause, Volume2, BookOpen, Sun, Ruler, Columns, List, Maximize2, Minimize2, RotateCw, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { TtsControls } from "./tts-controls";
import { FontControls } from "./font-controls";
import { ThemeControls } from "./theme-controls";
import { BookmarkPanel } from "./bookmark-panel";
import { ChapterPanel } from "./chapter-panel";
import { PresetControls } from "./preset-controls";
import { Bookmark, Timer } from "lucide-react";
import { TimerControls } from "./timer-controls";
import { KeyboardShortcutsOverlay } from "./keyboard-shortcuts-overlay";

export function PdfToolbar({ bookId }) {
  const router = useRouter();
  const { zoom, setZoom, currentPage, totalPages, setCurrentPage } = useStore(
    useShallow((s) => ({
      zoom: s.zoom,
      setZoom: s.setZoom,
      currentPage: s.currentPage,
      totalPages: s.totalPages,
      setCurrentPage: s.setCurrentPage,
    }))
  );
  const updateBook = useStore((s) => s.updateBook);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const { autoScrollMode, autoScrollSpeed, setAutoScrollMode, setAutoScrollSpeed, pageAnimation, pageAnimationSpeed, setPageAnimation, setPageAnimationSpeed, blueLightFilter, setBlueLightFilter, readingRuler, setReadingRuler, readingRulerStyle, setReadingRulerStyle, dualPageMode, setDualPageMode } = useStore(
    useShallow((s) => ({
      autoScrollMode: s.autoScrollMode,
      autoScrollSpeed: s.autoScrollSpeed,
      setAutoScrollMode: s.setAutoScrollMode,
      setAutoScrollSpeed: s.setAutoScrollSpeed,
      pageAnimation: s.pageAnimation,
      pageAnimationSpeed: s.pageAnimationSpeed,
      setPageAnimation: s.setPageAnimation,
      setPageAnimationSpeed: s.setPageAnimationSpeed,
      blueLightFilter: s.blueLightFilter,
      setBlueLightFilter: s.setBlueLightFilter,
      readingRuler: s.readingRuler,
      setReadingRuler: s.setReadingRuler,
      readingRulerStyle: s.readingRulerStyle,
      setReadingRulerStyle: s.setReadingRulerStyle,
      dualPageMode: s.dualPageMode,
      setDualPageMode: s.setDualPageMode,
    }))
  );
  const allBooks = useStore((s) => s.books);
  const fileCache = useStore((s) => s.fileCache);
  const { searchQuery, searchResults, searchCurrentIndex, setSearchQuery, setSearchResults, setSearchCurrentIndex } = useStore(
    useShallow((s) => ({
      searchQuery: s.searchQuery,
      searchResults: s.searchResults,
      searchCurrentIndex: s.searchCurrentIndex,
      setSearchQuery: s.setSearchQuery,
      setSearchResults: s.setSearchResults,
      setSearchCurrentIndex: s.setSearchCurrentIndex,
    }))
  );
  const book = useMemo(() => allBooks.find((b) => b.id === bookId), [allBooks, bookId]);
  const textContent = useMemo(() => {
    if (book?.format === "txt") return fileCache[bookId] || "";
    return "";
  }, [book, fileCache, bookId]);
  const [autoScrollOpen, setAutoScrollOpen] = useState(false);
  const [pageAnimOpen, setPageAnimOpen] = useState(false);
  const [blueLightOpen, setBlueLightOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const autoHideToolbar = useStore((s) => s.autoHideToolbar);
  const setAutoHideToolbar = useStore((s) => s.setAutoHideToolbar);
  const bookOrientation = useStore((s) => s.bookOrientation);
  const setBookOrientation = useStore((s) => s.setBookOrientation);
  const currentOrientation = bookOrientation[bookId] || "auto";

  const cycleOrientation = () => {
    const order = ["auto", "landscape", "portrait"];
    const idx = order.indexOf(currentOrientation);
    const next = order[(idx + 1) % order.length];
    setBookOrientation(bookId, next);
  };

  const orientationLabel = { auto: "A", landscape: "L", portrait: "P" };
  const isLocked = currentOrientation !== "auto";
  const [chapterOpen, setChapterOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  const timerRef = useClickOutside(timerOpen, () => setTimerOpen(false));
  const pageAnimRef = useClickOutside(pageAnimOpen, () => setPageAnimOpen(false));
  const autoScrollRef = useClickOutside(autoScrollOpen, () => setAutoScrollOpen(false));
  const blueLightRef = useClickOutside(blueLightOpen, () => setBlueLightOpen(false));

  const handlePageJump = (e) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput, 10);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
      setPageInput("");
    }
  };

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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Page</span>
              {totalPages > 0 ? (
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput || currentPage}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handlePageJump}
                  onBlur={() => setPageInput("")}
                  className="h-5 w-12 rounded border-none bg-transparent p-0 text-center text-xs focus-visible:ring-1"
                  aria-label="Page number"
                />
              ) : (
                <span>{currentPage}</span>
              )}
              <span>of {totalPages || "—"}</span>
            </div>
          </div>
          {/* Prev / Next page buttons */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {book?.status !== "finished" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-green-600 hover:text-green-700"
              onClick={() => updateBook(bookId, { status: "finished" })}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Finish</span>
            </Button>
          )}
          <TtsControls content={textContent} />
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTimerOpen(!timerOpen)}
              aria-label="Reading timer"
            >
              <Timer className="h-4 w-4" />
            </Button>
            {timerOpen && (
              <div ref={timerRef} className="absolute right-0 top-full mt-1 z-30 w-auto rounded-lg border bg-popover p-3 shadow-lg">
                <TimerControls />
              </div>
            )}
          </div>
          {book?.format === "epub" && (
            <Button
              variant={chapterOpen ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setChapterOpen(true)}
              aria-label="Table of contents"
            >
              <List className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant={readingRuler ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setReadingRuler(!readingRuler)}
            aria-label="Reading ruler"
          >
            <Ruler className="h-4 w-4" />
          </Button>
          <Button
            variant={bookmarkOpen ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setBookmarkOpen(!bookmarkOpen)}
            aria-label="Bookmarks"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant={dualPageMode ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDualPageMode(!dualPageMode)}
            aria-label="Dual page mode"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <PresetControls />
          <FontControls />
          <ThemeControls />
          <div className="relative">
            <Button
              variant={pageAnimation !== "none" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageAnimOpen(!pageAnimOpen)}
              aria-label="Page animation"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            {pageAnimOpen && (
              <div ref={pageAnimRef} className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border bg-popover p-3 shadow-lg">
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Page Animation</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { value: "none", label: "None" },
                      { value: "slide", label: "Slide" },
                      { value: "fade", label: "Fade" },
                      { value: "flip", label: "Flip" },
                      { value: "curl", label: "Curl" },
                    ].map((a) => (
                      <Button
                        key={a.value}
                        variant={pageAnimation === a.value ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-[10px] px-1"
                        onClick={() => { setPageAnimation(a.value); setPageAnimOpen(false); }}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </div>
                  {pageAnimation !== "none" && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Speed: {pageAnimationSpeed}ms</Label>
                      <Slider
                        min={100}
                        max={800}
                        step={50}
                        value={[pageAnimationSpeed]}
                        onValueChange={([v]) => setPageAnimationSpeed(v)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant={autoScrollMode !== "off" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setAutoScrollOpen(!autoScrollOpen)}
              aria-label="Auto-scroll"
            >
              {autoScrollMode !== "off" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {autoScrollOpen && (
              <div ref={autoScrollRef} className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border bg-popover p-3 shadow-lg">
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Auto-scroll</Label>
                  <div className="flex gap-1">
                    {[
                      { value: "off", label: "Off" },
                      { value: "rolling", label: "Rolling" },
                      { value: "pixel", label: "Pixel" },
                      { value: "line", label: "Line" },
                      { value: "page", label: "Page" },
                    ].map((m) => (
                      <Button
                        key={m.value}
                        variant={autoScrollMode === m.value ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-[10px] px-1.5"
                        onClick={() => { setAutoScrollMode(m.value); if (m.value !== "off") setAutoScrollOpen(false); }}
                      >
                        {m.label}
                      </Button>
                    ))}
                  </div>
                  {autoScrollMode !== "off" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground">Speed</Label>
                        <span className="text-[10px] text-muted-foreground">{autoScrollSpeed}</span>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[autoScrollSpeed]}
                        onValueChange={([v]) => setAutoScrollSpeed(v)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant={blueLightFilter > 0 ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setBlueLightOpen(!blueLightOpen)}
              aria-label="Blue light filter"
            >
              <Sun className="h-4 w-4" />
            </Button>
            {blueLightOpen && (
              <div ref={blueLightRef} className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border bg-popover p-3 shadow-lg">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Blue Light Filter</Label>
                  <Slider
                    min={0}
                    max={95}
                    step={5}
                    value={[blueLightFilter]}
                    onValueChange={([v]) => setBlueLightFilter(v)}
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Off</span>
                    <span>{blueLightFilter}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            variant={autoHideToolbar ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setAutoHideToolbar(!autoHideToolbar)}
            aria-label="Toggle fullscreen mode"
          >
            {autoHideToolbar ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant={isLocked ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 relative"
            onClick={cycleOrientation}
            aria-label={`Orientation: ${currentOrientation}`}
          >
            <RotateCw className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold leading-none bg-background rounded-sm px-[2px]">{orientationLabel[currentOrientation]}</span>
            {isLocked && <Lock className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-muted-foreground" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSearchOpen(!searchOpen)}
          >
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
          <KeyboardShortcutsOverlay />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t px-3 py-2 flex items-center gap-2">
          <Input
            placeholder="Search in document..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <span>{searchResults.length > 0 ? `${searchCurrentIndex + 1}/${searchResults.length}` : "0 results"}</span>
              <button
                className="hover:text-foreground disabled:opacity-30"
                disabled={searchResults.length === 0}
                onClick={() => {
                  const prev = (searchCurrentIndex - 1 + searchResults.length) % searchResults.length;
                  setSearchCurrentIndex(prev);
                }}
              >
                ↑
              </button>
              <button
                className="hover:text-foreground disabled:opacity-30"
                disabled={searchResults.length === 0}
                onClick={() => {
                  const next = (searchCurrentIndex + 1) % searchResults.length;
                  setSearchCurrentIndex(next);
                }}
              >
                ↓
              </button>
              <button
                className="hover:text-foreground ml-1"
                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchCurrentIndex(-1); }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {book && book.totalPages > 0 && (
        <div className="px-3 pb-2 lg:px-4">
          <Progress value={book.progress} className="h-0.5" />
        </div>
      )}

      {chapterOpen && (
        <ChapterPanel open={chapterOpen} onOpenChange={setChapterOpen} />
      )}
      {bookmarkOpen && (
        <BookmarkPanel bookId={bookId} currentPage={currentPage} onClose={() => setBookmarkOpen(false)} onJumpToPage={(p) => setCurrentPage(p)} />
      )}
    </div>
  );
}
