"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronRight, BookOpen } from "lucide-react";
import useStore from "@/lib/store";
import { getCoverColor } from "@/lib/cover-colors";

export function ContinueReading() {
  const allBooks = useStore((s) => s.books);
  const books = useMemo(() => allBooks.filter((b) => b.status === "reading"), [allBooks]);

  if (books.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Continue Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No books in progress</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a book and start reading
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Continue Reading</CardTitle>
        <Link href="/library">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/reader/${book.id}`}
              className="group min-w-[200px] flex-1"
            >
              <div className={`aspect-[3/4] rounded-lg ${getCoverColor(book.title)} flex items-center justify-center p-4 transition-transform group-hover:scale-[1.02]`}>
                <div className="text-center">
                  <p className="font-literata text-sm font-semibold leading-tight">
                    {book.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {book.author}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{book.progress}%</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {book.currentPage}/{book.totalPages}
                  </span>
                </div>
                <Progress value={book.progress} className="h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
