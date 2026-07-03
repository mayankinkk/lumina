"use client";

import { useState, useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { UploadZone } from "@/components/library/upload-zone";
import { BookCard } from "@/components/library/book-card";
import { BookListItem } from "@/components/library/book-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, Search, BookOpen, ArrowUpDown } from "lucide-react";
import useStore from "@/lib/store";
import { OpdsBrowser } from "@/components/library/opds-browser";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Reading", value: "reading" },
  { label: "Finished", value: "finished" },
  { label: "Want to Read", value: "want_to_read" },
];

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTag, setActiveTag] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const books = useStore((s) => s.books);
  const getAllTags = useStore((s) => s.getAllTags);
  const allTags = useMemo(() => getAllTags(), [books, getAllTags]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(q) ||
        (book.author || "").toLowerCase().includes(q) ||
        (book.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesFilter = activeFilter === "all" || book.status === activeFilter;
      const matchesTag = !activeTag || (book.tags || []).includes(activeTag);
      return matchesSearch && matchesFilter && matchesTag;
    });
  }, [books, searchQuery, activeFilter, activeTag]);

  const sortedBooks = useMemo(() => {
    const list = [...filteredBooks];
    switch (sortBy) {
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        list.sort((a, b) => (a.author || "").localeCompare(b.author || ""));
        break;
      case "progress":
        list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case "recent":
      default:
        list.sort((a, b) => new Date(b.lastOpened || 0) - new Date(a.lastOpened || 0));
        break;
    }
    return list;
  }, [filteredBooks, sortBy]);

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length === 0
              ? "Upload your first book to get started"
              : `${books.length} book${books.length !== 1 ? "s" : ""} in your library`}
          </p>
        </div>

        <UploadZone />

        {books.length > 0 && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent" className="text-xs">Recent</SelectItem>
                    <SelectItem value="title" className="text-xs">Title</SelectItem>
                    <SelectItem value="author" className="text-xs">Author</SelectItem>
                    <SelectItem value="progress" className="text-xs">Progress</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg border p-0.5">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <OpdsBrowser />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {allTags.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <Button
                  variant={!activeTag ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setActiveTag("")}
                >
                  All Tags
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={activeTag === tag ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {sortedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedBooks.map((book) => (
                  <BookListItem key={book.id} book={book} />
                ))}
              </div>
            )}

            {sortedBooks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No books found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search or filter
                </p>
              </div>
            )}
          </>
        )}

        {books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Your library is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a PDF or TXT file to start reading
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Supported formats:</span>
          {["PDF", "EPUB", "CBZ", "DOCX", "ODT", "RTF", "HTML", "MD", "TXT"].map((fmt) => (
            <Badge key={fmt} variant="secondary" className="text-[10px]">
              {fmt}
            </Badge>
          ))}
        </div>
      </div>
    </ShellLayout>
  );
}
