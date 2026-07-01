"use client";

import { useState, useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Play, ChevronLeft, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import useStore from "@/lib/store";
import { calculateNextReview, getDueWords } from "@/lib/sm2";

const masteryColors = {
  A2: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  B1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  B2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  C1: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  C2: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function VocabularyPage() {
  const vocabulary = useStore((s) => s.vocabulary);
  const updateVocabularyWord = useStore((s) => s.updateVocabularyWord);
  const removeVocabularyWord = useStore((s) => s.removeVocabularyWord);

  const [selectedWord, setSelectedWord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMastery, setFilterMastery] = useState("all");
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const filtered = useMemo(() => {
    return vocabulary.filter((w) => {
      const matchesSearch =
        !searchQuery || w.word.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterMastery === "all" || w.mastery === filterMastery;
      return matchesSearch && matchesFilter;
    });
  }, [vocabulary, searchQuery, filterMastery]);

  const dueWords = useMemo(() => getDueWords(vocabulary), [vocabulary]);

  const handleReview = (wordId, quality) => {
    const word = vocabulary.find((w) => w.id === wordId);
    if (!word) return;
    const updates = calculateNextReview(word, quality);
    updateVocabularyWord(wordId, updates);

    if (flashcardMode && flashcardIndex < filtered.length - 1) {
      setFlashcardIndex(flashcardIndex + 1);
      setFlashcardFlipped(false);
    } else if (flashcardMode) {
      setFlashcardMode(false);
      setFlashcardIndex(0);
    }
  };

  if (flashcardMode) {
    const word = filtered[flashcardIndex];
    if (!word) {
      setFlashcardMode(false);
      return null;
    }

    return (
      <ShellLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setFlashcardMode(false)}>
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                {flashcardIndex + 1} / {filtered.length}
              </span>
            </div>

            <Card
              className="min-h-[300px] cursor-pointer"
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                {!flashcardFlipped ? (
                  <>
                    <p className="text-3xl font-semibold font-literata">{word.word}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{word.partOfSpeech}</p>
                    {word.pronunciation && (
                      <p className="mt-1 text-xs text-muted-foreground">{word.pronunciation}</p>
                    )}
                    <p className="mt-4 text-sm text-muted-foreground">Tap to reveal</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg">{word.meaning || "No definition yet"}</p>
                    {word.example && (
                      <p className="mt-4 text-sm italic text-muted-foreground font-literata">
                        &ldquo;{word.example}&rdquo;
                      </p>
                    )}
                    {word.synonyms?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 justify-center">
                        {word.synonyms.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {flashcardFlipped && (
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleReview(word.id, 1)}>
                  Hard
                </Button>
                <Button size="sm" onClick={() => handleReview(word.id, 3)}>
                  Good
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleReview(word.id, 5)}
                >
                  Easy
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="ghost"
                disabled={flashcardIndex <= 0}
                onClick={() => {
                  setFlashcardIndex(flashcardIndex - 1);
                  setFlashcardFlipped(false);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="ghost"
                disabled={flashcardIndex >= filtered.length - 1}
                onClick={() => {
                  setFlashcardIndex(flashcardIndex + 1);
                  setFlashcardFlipped(false);
                }}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Vocabulary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {vocabulary.length === 0
              ? "Save words from the reader to build your vocabulary"
              : `${vocabulary.length} word${vocabulary.length !== 1 ? "s" : ""} saved`}
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
                {dueWords.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {dueWords.length} due for review
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={filtered.length === 0}
                  onClick={() => {
                    setFlashcardMode(true);
                    setFlashcardIndex(0);
                    setFlashcardFlipped(false);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" /> Practice
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search words..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
              {["all", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                <Button
                  key={level}
                  variant={filterMastery === level ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setFilterMastery(level)}
                >
                  {level === "all" ? "All" : level}
                </Button>
              ))}
            </div>

            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {vocabulary.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No words saved yet
                </p>
              )}
              {filtered.map((word) => (
                <button
                  key={word.id}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedWord?.id === word.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedWord(word)}
                >
                  <p className="text-sm font-medium">{word.word}</p>
                  <p className="text-xs text-muted-foreground">{word.partOfSpeech}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            {selectedWord ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-literata">
                        {selectedWord.word}
                      </CardTitle>
                      {selectedWord.pronunciation && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedWord.pronunciation}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary">{selectedWord.partOfSpeech}</Badge>
                      <Badge className={masteryColors[selectedWord.mastery] || masteryColors.A2}>
                        {selectedWord.mastery}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mastery</span>
                      <span className="font-medium">{selectedWord.masteryLevel || 0}%</span>
                    </div>
                    <Progress value={selectedWord.masteryLevel || 0} className="h-2" />
                  </div>

                  {selectedWord.meaning && (
                    <div>
                      <p className="text-sm font-medium mb-1">Meaning</p>
                      <p className="text-sm text-muted-foreground">{selectedWord.meaning}</p>
                    </div>
                  )}

                  {selectedWord.example && (
                    <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
                      <p className="text-sm font-literata italic text-muted-foreground">
                        &ldquo;{selectedWord.example}&rdquo;
                      </p>
                    </div>
                  )}

                  {selectedWord.synonyms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Synonyms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedWord.synonyms.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWord.antonyms?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Antonyms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedWord.antonyms.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWord.etymology && (
                    <div className="rounded-lg border-l-2 border-green-500 bg-green-50 dark:bg-green-950/20 p-3">
                      <p className="text-xs font-medium mb-1 text-green-700 dark:text-green-300">
                        Etymology
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedWord.etymology}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Next Review</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedWord.nextReview
                          ? new Date(selectedWord.nextReview).toLocaleDateString()
                          : "Not scheduled"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(selectedWord.id, 1)}
                      >
                        Hard
                      </Button>
                      <Button size="sm" onClick={() => handleReview(selectedWord.id, 3)}>
                        Good
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleReview(selectedWord.id, 5)}
                      >
                        Easy
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      removeVocabularyWord(selectedWord.id);
                      setSelectedWord(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                {vocabulary.length === 0
                  ? "Save words from the reader to start building your vocabulary"
                  : "Select a word to view details"}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
