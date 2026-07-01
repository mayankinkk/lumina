"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronRight } from "lucide-react";
import useStore from "@/lib/store";

export function ContinueReading() {
  const books = useStore((s) => s.books.filter((b) => b.status === "reading"));

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
              <div className={`aspect-[3/4] rounded-lg ${book.coverColor} flex items-center justify-center p-4 transition-transform group-hover:scale-[1.02]`}>
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
                    {book.estimatedTimeLeft}
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
