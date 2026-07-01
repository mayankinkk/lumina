"use client";

import { useState } from "react";
import ShellLayout from "@/components/layout/shell";
import { UploadZone } from "@/components/library/upload-zone";
import { BookCard } from "@/components/library/book-card";
import { BookListItem } from "@/components/library/book-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List, Search } from "lucide-react";
import useStore from "@/lib/store";

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
  const books = useStore((s) => s.books);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || book.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your book collection
          </p>
        </div>

        <UploadZone />

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

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <BookListItem key={book.id} book={book} />
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No books found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search or filter
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Supported formats:</span>
          {["PDF", "EPUB", "MOBI", "TXT", "DOCX"].map((fmt) => (
            <Badge key={fmt} variant="secondary" className="text-[10px]">
              {fmt}
            </Badge>
          ))}
        </div>
      </div>
    </ShellLayout>
  );
}
