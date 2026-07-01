"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const coverColors = [
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-blue-100 dark:bg-blue-900/30",
  "bg-green-100 dark:bg-green-900/30",
  "bg-purple-100 dark:bg-purple-900/30",
  "bg-rose-100 dark:bg-rose-900/30",
  "bg-stone-100 dark:bg-stone-900/30",
  "bg-indigo-100 dark:bg-indigo-900/30",
  "bg-teal-100 dark:bg-teal-900/30",
];

function getCoverColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return coverColors[Math.abs(hash) % coverColors.length];
}

export function BookListItem({ book }) {
  const statusConfig = {
    reading: { label: "READING", icon: BookOpen, className: "text-green-600 dark:text-green-400" },
    finished: { label: "FINISHED", icon: CheckCircle2, className: "text-muted-foreground" },
    want_to_read: { label: "WANT TO READ", icon: null, className: "text-muted-foreground" },
  };

  const status = statusConfig[book.status];
  const coverColor = getCoverColor(book.title);

  return (
    <Link href={`/reader/${book.id}`}>
      <div className={cn(
        "group flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent",
        book.status === "finished" && "opacity-70"
      )}>
        <div className={cn("h-16 w-12 shrink-0 rounded flex items-center justify-center p-1", coverColor)}>
          <p className="font-literata text-[8px] font-semibold text-center leading-tight">
            {book.title}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium truncate">{book.title}</p>
              <p className="text-xs text-muted-foreground">{book.author}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0 uppercase">
              {book.format}
            </Badge>
          </div>
          {book.status === "reading" && book.totalPages > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{book.progress}%</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {book.currentPage}/{book.totalPages}
                </span>
              </div>
              <Progress value={book.progress} className="h-1" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {status.icon && <status.icon className={cn("h-3.5 w-3.5", status.className)} />}
          <span className={cn("text-xs", status.className)}>{status.label}</span>
        </div>
      </div>
    </Link>
  );
}
