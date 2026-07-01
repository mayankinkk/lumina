"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const masteryColors = {
  A2: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  B2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  C1: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  C2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export function WordDetail({ word, onReview, onRemove }) {
  if (!word) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Select a word to view details
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-literata">{word.word}</CardTitle>
            {word.pronunciation && <p className="mt-1 text-sm text-muted-foreground">{word.pronunciation}</p>}
          </div>
          <div className="flex gap-1">
            <Badge variant="secondary">{word.partOfSpeech}</Badge>
            <Badge className={masteryColors[word.mastery] || masteryColors.A2}>{word.mastery}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mastery</span>
            <span className="font-medium">{word.masteryLevel || 0}%</span>
          </div>
          <Progress value={word.masteryLevel || 0} className="h-2" />
        </div>

        {word.meaning && (
          <div>
            <p className="text-sm font-medium mb-1">Meaning</p>
            <p className="text-sm text-muted-foreground">{word.meaning}</p>
          </div>
        )}

        {word.example && (
          <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
            <p className="text-sm font-literata italic text-muted-foreground">&ldquo;{word.example}&rdquo;</p>
          </div>
        )}

        {word.synonyms?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Synonyms</p>
            <div className="flex flex-wrap gap-1.5">
              {word.synonyms.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
            </div>
          </div>
        )}

        {word.antonyms?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Antonyms</p>
            <div className="flex flex-wrap gap-1.5">
              {word.antonyms.map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
            </div>
          </div>
        )}

        {word.etymology && (
          <div className="rounded-lg border-l-2 border-green-500 bg-green-50 dark:bg-green-950/20 p-3">
            <p className="text-xs font-medium mb-1 text-green-700 dark:text-green-300">Etymology</p>
            <p className="text-sm text-muted-foreground">{word.etymology}</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Next Review</p>
            <p className="text-xs text-muted-foreground">
              {word.nextReview ? new Date(word.nextReview).toLocaleDateString() : "Not scheduled"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onReview(word.id, 1)}>Hard</Button>
            <Button size="sm" onClick={() => onReview(word.id, 3)}>Good</Button>
            <Button variant="secondary" size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => onReview(word.id, 5)}>Easy</Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onRemove(word.id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Remove
        </Button>
      </CardContent>
    </Card>
  );
}
