"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, BookOpen } from "lucide-react";

export function BookCard({ book }) {
  const statusConfig = {
    reading: { label: "READING", icon: BookOpen, variant: "default" },
    finished: { label: "FINISHED", icon: CheckCircle2, variant: "secondary" },
    want_to_read: { label: "WANT TO READ", icon: null, variant: "outline" },
  };

  const status = statusConfig[book.status];

  return (
    <Link href={`/reader/${book.id}`}>
      <Card className={`group overflow-hidden transition-all hover:shadow-md ${book.status === "finished" ? "opacity-75 hover:opacity-100" : ""}`}>
        <div className={`aspect-[3/4] ${book.coverColor} flex items-center justify-center p-6 relative`}>
          {book.status === "finished" && (
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          )}
          <div className="text-center relative z-10">
            <p className="font-literata text-base font-semibold leading-tight">
              {book.title}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {book.author}
            </p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={status.variant} className="text-[10px]">
              {status.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {book.format}
            </Badge>
          </div>
          {book.status === "reading" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{book.progress}% complete</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {book.estimatedTimeLeft}
                </span>
              </div>
              <Progress value={book.progress} className="h-1.5" />
            </div>
          )}
          {book.status === "finished" && (
            <p className="text-xs text-muted-foreground">Completed</p>
          )}
          {book.status === "want_to_read" && (
            <p className="text-xs text-muted-foreground">
              {book.totalPages} pages
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
