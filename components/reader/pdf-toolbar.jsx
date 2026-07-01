"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut, Search, RotateCcw } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
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
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
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
