"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Highlighter, StickyNote } from "lucide-react";
import useStore from "@/lib/store";

const quickAccess = [
  {
    label: "Vocabulary",
    icon: BookMarked,
    href: "/vocabulary",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Highlights",
    icon: Highlighter,
    href: "/notes",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    label: "Notes",
    icon: StickyNote,
    href: "/notes",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
];

export function RecentActivity() {
  const vocabCount = useStore((s) => s.vocabulary.length);
  const notesCount = useStore((s) => s.notes.length);

  const counts = {
    Vocabulary: `${vocabCount} words`,
    Highlights: "From Atomic Habits",
    Notes: `${notesCount} notes`,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {quickAccess.map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="group flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{counts[item.label]}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
