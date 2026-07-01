"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FlashcardMode({ words, onReview, onExit }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleReview = useCallback((quality) => {
    onReview(words[index].id, quality);
    if (index < words.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      onExit();
    }
  }, [index, words, onReview, onExit]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "1") {
        handleReview(1);
      } else if (flipped && e.key === "2") {
        handleReview(3);
      } else if (flipped && e.key === "3") {
        handleReview(5);
      } else if (e.key === "ArrowLeft" && index > 0) {
        setIndex((i) => i - 1);
        setFlipped(false);
      } else if (e.key === "ArrowRight" && index < words.length - 1) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipped, index, words.length, handleReview, onExit]);

  if (words.length === 0) {
    onExit();
    return null;
  }

  const word = words[index];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onExit}>Back</Button>
          <span className="text-sm text-muted-foreground">{index + 1} / {words.length}</span>
        </div>

        <Card className="min-h-[300px] cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {!flipped ? (
              <>
                <p className="text-3xl font-semibold font-literata">{word.word}</p>
                <p className="mt-2 text-sm text-muted-foreground">{word.partOfSpeech}</p>
                {word.pronunciation && <p className="mt-1 text-xs text-muted-foreground">{word.pronunciation}</p>}
                <p className="mt-4 text-sm text-muted-foreground">Tap to reveal</p>
              </>
            ) : (
              <>
                <p className="text-lg">{word.meaning || "No definition yet"}</p>
                {word.example && (
                  <p className="mt-4 text-sm italic text-muted-foreground font-literata">&ldquo;{word.example}&rdquo;</p>
                )}
                {word.synonyms?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {word.synonyms.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {flipped && (
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleReview(1)}>Hard <kbd className="ml-1 text-[10px] opacity-60">1</kbd></Button>
            <Button size="sm" onClick={() => handleReview(3)}>Good <kbd className="ml-1 text-[10px] opacity-60">2</kbd></Button>
            <Button variant="secondary" size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleReview(5)}>Easy <kbd className="ml-1 text-[10px] opacity-60">3</kbd></Button>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" disabled={index <= 0} onClick={() => { setIndex(index - 1); setFlipped(false); }}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="ghost" disabled={index >= words.length - 1} onClick={() => { setIndex(index + 1); setFlipped(false); }}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
