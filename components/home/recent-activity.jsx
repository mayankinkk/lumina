"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Highlighter, StickyNote } from "lucide-react";
import useStore from "@/lib/store";

export function RecentActivity() {
  const vocabulary = useStore((s) => s.vocabulary);
  const highlights = useStore((s) => s.highlights);
  const notes = useStore((s) => s.notes);

  const items = useMemo(
    () => [
      {
        label: "Vocabulary",
        icon: BookMarked,
        href: "/vocabulary",
        count: vocabulary.length,
        unit: "words",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
      },
      {
        label: "Highlights",
        icon: Highlighter,
        href: "/notes",
        count: highlights.length,
        unit: "highlights",
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
      },
      {
        label: "Notes",
        icon: StickyNote,
        href: "/notes",
        count: notes.length,
        unit: "notes",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/30",
      },
    ],
    [vocabulary, highlights, notes]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="group flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.unit}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
