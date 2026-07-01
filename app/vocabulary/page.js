"use client";

import { useState, useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play } from "lucide-react";
import useStore from "@/lib/store";
import { calculateNextReview, getDueWords } from "@/lib/sm2";
import { FlashcardMode } from "@/components/vocabulary/flashcard-mode";
import { WordDetail } from "@/components/vocabulary/word-detail";

export default function VocabularyPage() {
  const vocabulary = useStore((s) => s.vocabulary);
  const updateVocabularyWord = useStore((s) => s.updateVocabularyWord);
  const removeVocabularyWord = useStore((s) => s.removeVocabularyWord);
  const [selectedWord, setSelectedWord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMastery, setFilterMastery] = useState("all");
  const [flashcardMode, setFlashcardMode] = useState(false);

  const filtered = useMemo(() => {
    return vocabulary.filter((w) => {
      const matchesSearch = !searchQuery || w.word.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterMastery === "all" || w.mastery === filterMastery;
      return matchesSearch && matchesFilter;
    });
  }, [vocabulary, searchQuery, filterMastery]);

  const dueWords = useMemo(() => getDueWords(vocabulary), [vocabulary]);

  const handleReview = (wordId, quality) => {
    const word = vocabulary.find((w) => w.id === wordId);
    if (!word) return;
    updateVocabularyWord(wordId, calculateNextReview(word, quality));
  };

  if (flashcardMode) {
    return (
      <ShellLayout>
        <FlashcardMode
          words={dueWords.length > 0 ? dueWords : filtered}
          onReview={handleReview}
          onExit={() => setFlashcardMode(false)}
        />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Vocabulary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {vocabulary.length === 0 ? "Save words from the reader to build your vocabulary" : `${vocabulary.length} word${vocabulary.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Your Collection</p>
                  <Badge variant="secondary">{vocabulary.length} words</Badge>
                </div>
                {dueWords.length > 0 && <p className="text-xs text-muted-foreground">{dueWords.length} due for review</p>}
                <Button className="w-full" disabled={vocabulary.length === 0} onClick={() => setFlashcardMode(true)}>
                  <Play className="h-4 w-4 mr-2" /> Practice {dueWords.length > 0 ? `(${dueWords.length} due)` : ""}
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search words..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
              {["all", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <Button key={level} variant={filterMastery === level ? "default" : "outline"} size="sm" className="shrink-0 text-xs" onClick={() => setFilterMastery(level)}>
                  {level === "all" ? "All" : level}
                </Button>
              ))}
            </div>

            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {vocabulary.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No words saved yet</p>}
              {filtered.map((word) => (
                <button
                  key={word.id}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${selectedWord?.id === word.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  onClick={() => setSelectedWord(word)}
                >
                  <p className="text-sm font-medium">{word.word}</p>
                  <p className="text-xs text-muted-foreground">{word.partOfSpeech}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <WordDetail
              word={selectedWord}
              onReview={handleReview}
              onRemove={(id) => { removeVocabularyWord(id); setSelectedWord(null); }}
            />
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
