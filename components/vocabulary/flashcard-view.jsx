"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { calculateNextReview } from "@/lib/sm2";
import useStore from "@/lib/store";
import { CheckCircle, ArrowLeft } from "lucide-react";

const RATINGS = [
  { label: "Again", quality: 0, color: "bg-red-600 hover:bg-red-700 text-white" },
  { label: "Hard", quality: 2, color: "bg-orange-600 hover:bg-orange-700 text-white" },
  { label: "Good", quality: 3, color: "bg-green-600 hover:bg-green-700 text-white" },
  { label: "Easy", quality: 5, color: "bg-blue-600 hover:bg-blue-700 text-white" },
];

export function FlashcardView({ words, open, onOpenChange }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [complete, setComplete] = useState(false);
  const updateVocabularyWord = useStore((s) => s.updateVocabularyWord);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      setFlipped(false);
      setComplete(false);
    }
  }, [open]);

  const handleRating = useCallback((quality) => {
    const word = words[index];
    if (!word) return;

    const result = calculateNextReview(word, quality);
    updateVocabularyWord(word.id, result);

    if (index < words.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setComplete(true);
    }
  }, [index, words, updateVocabularyWord]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped && !complete) setFlipped(true);
      } else if (flipped && !complete) {
        const keyMap = { 1: 0, 2: 2, 3: 3, 4: 5 };
        if (keyMap[e.key] !== undefined) handleRating(keyMap[e.key]);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipped, complete, handleRating, onOpenChange, open]);

  if (!words || words.length === 0) return null;

  const word = words[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg" showCloseButton={false}>
        {!complete ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Card {index + 1} / {words.length}
              </span>
            </div>

            <div
              className="min-h-[260px] rounded-xl border bg-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-md"
              onClick={() => !flipped && setFlipped(true)}
            >
              {!flipped ? (
                <>
                  <p className="text-3xl font-semibold font-literata">{word.word}</p>
                  {word.partOfSpeech && (
                    <p className="mt-1 text-xs text-muted-foreground">{word.partOfSpeech}</p>
                  )}
                  {word.context && (
                    <p className="mt-4 text-sm italic text-muted-foreground font-literata">
                      &ldquo;{word.context}&rdquo;
                    </p>
                  )}
                  <p className="mt-6 text-xs text-muted-foreground">Tap or press Space to reveal</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">{word.meaning || "No definition yet"}</p>
                  {word.example && word.example !== word.word && (
                    <p className="mt-4 text-sm italic text-muted-foreground font-literata">
                      &ldquo;{word.example}&rdquo;
                    </p>
                  )}
                  {word.synonyms?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                      {word.synonyms.map((s) => (
                        <span key={s} className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{s}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {flipped && (
              <div className="flex justify-center gap-2">
                {RATINGS.map((r, i) => (
                  <Button key={r.quality} size="sm" className={r.color} onClick={() => handleRating(r.quality)}>
                    {r.label} <kbd className="ml-1 text-[10px] opacity-60">{i + 1}</kbd>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold">Review Complete!</h2>
            <p className="text-sm text-muted-foreground text-center">
              You reviewed all {words.length} word{words.length !== 1 ? "s" : ""}.
            </p>
            <p className="text-xs text-muted-foreground">
              Next review:{" "}
              {(() => {
                const dates = words
                  .map((w) => w.nextReview && new Date(w.nextReview))
                  .filter(Boolean)
                  .sort((a, b) => a - b);
                return dates.length > 0
                  ? dates[0].toLocaleDateString()
                  : "Not scheduled";
              })()}
            </p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
