"use client";

import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";
import useStore from "@/lib/store";
import { useRouter } from "next/navigation";

export function GlobalSearch({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const books = useStore((s) => s.books);
  const notes = useStore((s) => s.notes);
  const highlights = useStore((s) => s.highlights);
  const vocabulary = useStore((s) => s.vocabulary);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query || query.length < 2) return { books: [], notes: [], highlights: [], vocabulary: [] };
    const q = query.toLowerCase();
    return {
      books: books.filter((b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)),
      notes: notes.filter((n) => n.text?.toLowerCase().includes(q)),
      highlights: highlights.filter((h) => h.text?.toLowerCase().includes(q)),
      vocabulary: vocabulary.filter((v) => v.word?.toLowerCase().includes(q) || v.meaning?.toLowerCase().includes(q)),
    };
  }, [query, books, notes, highlights, vocabulary]);

  const totalResults = results.books.length + results.notes.length + results.highlights.length + results.vocabulary.length;

  const handleSelect = useCallback((type, item) => {
    if (type === "book" && item.id) {
      router.push(`/reader/${item.id}`);
    } else if (type === "note" && item.bookId) {
      router.push(`/reader/${item.bookId}`);
    } else if (type === "highlight" && item.bookId) {
      router.push(`/reader/${item.bookId}`);
    } else if (type === "vocabulary") {
      router.push("/vocabulary");
    }
    onOpenChange(false);
    setQuery("");
  }, [router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Search Everything
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search books, notes, highlights, vocabulary..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mt-2">
          {query.length >= 2 && totalResults === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No results found for &ldquo;{query}&rdquo;</p>
          )}
          {results.books.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Books ({results.books.length})</p>
              {results.books.map((b) => (
                <button key={b.id} onClick={() => handleSelect("book", b)} className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent text-left">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.author}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results.notes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes ({results.notes.length})</p>
              {results.notes.slice(0, 5).map((n) => (
                <button key={n.id} onClick={() => handleSelect("note", n)} className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent text-left">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: n.color }} />
                  <p className="text-sm truncate">{n.text}</p>
                </button>
              ))}
            </div>
          )}
          {results.highlights.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Highlights ({results.highlights.length})</p>
              {results.highlights.slice(0, 5).map((h) => (
                <button key={h.id} onClick={() => handleSelect("highlight", h)} className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent text-left">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                  <p className="text-sm truncate">{h.text}</p>
                </button>
              ))}
            </div>
          )}
          {results.vocabulary.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Vocabulary ({results.vocabulary.length})</p>
              {results.vocabulary.slice(0, 5).map((v) => (
                <button key={v.id} onClick={() => handleSelect("vocabulary", v)} className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent text-left">
                  <p className="text-sm font-medium">{v.word}</p>
                  <p className="text-xs text-muted-foreground truncate">{v.meaning}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
