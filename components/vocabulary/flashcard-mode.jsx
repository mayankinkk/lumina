"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FlashcardMode({ words, onReview, onExit }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (words.length === 0) {
    onExit();
    return null;
  }

  const word = words[index];

  const handleReview = (quality) => {
    onReview(word.id, quality);
    if (index < words.length - 1) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      onExit();
    }
  };

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
            <Button variant="outline" size="sm" onClick={() => handleReview(1)}>Hard</Button>
            <Button size="sm" onClick={() => handleReview(3)}>Good</Button>
            <Button variant="secondary" size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleReview(5)}>Easy</Button>
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
