"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";

export function HighlightCard({ highlight, bookTitle, onEdit, onDelete }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: highlight.color }} />
      <CardContent className="pl-5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-literata italic text-muted-foreground">&ldquo;{highlight.text}&rdquo;</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookTitle}{highlight.page ? ` · Page ${highlight.page}` : ""}
            </p>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(highlight)} aria-label="Edit highlight">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(highlight.id)} aria-label="Delete highlight">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoteCard({ note, onEdit, onDelete }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: note.color }} />
      <CardHeader className="pb-2 pl-5">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{note.bookTitle || "Note"}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {note.page ? `Page ${note.page} · ` : ""}{new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(note)} aria-label="Edit note">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(note.id)} aria-label="Delete note">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-5">
        <p className="text-sm font-literata">{note.text}</p>
      </CardContent>
    </Card>
  );
}
