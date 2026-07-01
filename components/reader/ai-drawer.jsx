"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import useStore from "@/lib/store";

export function AiDrawer({ text, action, onClose }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vocabulary = useStore((s) => s.vocabulary);
  const updateVocabularyWord = useStore((s) => s.updateVocabularyWord);

  useEffect(() => {
    let cancelled = false;

    async function fetchAi() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, action }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || "Failed to get AI response");
        } else {
          setResponse({ result: data.result });

          if (action === "define") {
            try {
              const jsonMatch = data.result.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const word = vocabulary.find((w) => w.word.toLowerCase() === text.toLowerCase());
                if (word) {
                  updateVocabularyWord(word.id, {
                    meaning: parsed.meaning || word.meaning,
                    partOfSpeech: parsed.partOfSpeech || word.partOfSpeech,
                    pronunciation: parsed.pronunciation || word.pronunciation,
                    synonyms: parsed.synonyms || word.synonyms,
                    antonyms: parsed.antonyms || word.antonyms,
                    etymology: parsed.etymology || word.etymology,
                  });
                }
              }
            } catch {}
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError("Network error. Check your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAi();
    return () => { cancelled = true; };
  }, [text, action, vocabulary, updateVocabularyWord]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border bg-background p-6 shadow-xl animate-in slide-in-from-bottom duration-200 lg:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">
            {action === "define" ? "Definition" : action === "translate" ? "Translation" : "AI Explanation"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{text}</p>
            <div className="rounded-lg border-l-2 border-destructive bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">{text}</p>
            <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{response?.result}</p>
            </div>
            {action === "define" && (
              <p className="text-xs text-green-600 dark:text-green-400">Vocabulary auto-filled</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
