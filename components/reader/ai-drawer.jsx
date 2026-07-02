"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useStore from "@/lib/store";

const languages = [
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Chinese", label: "Chinese" },
  { value: "Korean", label: "Korean" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Russian", label: "Russian" },
  { value: "English", label: "English" },
];

export function AiDrawer({ text, action, onClose }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetLang, setTargetLang] = useState("Spanish");
  const vocabulary = useStore((s) => s.vocabulary);
  const updateVocabularyWord = useStore((s) => s.updateVocabularyWord);
  // Keep a ref so the effect can read current vocab without it being a dependency
  const vocabRef = useRef(vocabulary);
  const updateVocabRef = useRef(updateVocabularyWord);
  useEffect(() => { vocabRef.current = vocabulary; }, [vocabulary]);
  useEffect(() => { updateVocabRef.current = updateVocabularyWord; }, [updateVocabularyWord]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAi() {
      setLoading(true);
      setError(null);

      try {
        const body = { text, action };
        if (action === "translate") body.targetLanguage = targetLang;

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || "Failed to get AI response");
        } else {
          setResponse({ result: data.result });

          if (action === "define") {
            try {
              const jsonMatch = data.result.match(/{[\s\S]*}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const word = vocabRef.current.find((w) => w.word.toLowerCase() === text.toLowerCase());
                if (word) {
                  updateVocabRef.current(word.id, {
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
      } catch {
        if (!cancelled) setError("Network error. Check your connection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAi();
    return () => { cancelled = true; };
  }, [text, action, targetLang]);

  const titles = { define: "Definition", translate: "Translation", explain: "AI Explanation" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl border bg-background p-6 shadow-xl animate-in slide-in-from-bottom duration-200 lg:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{titles[action] || "AI Explanation"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        {action === "translate" && !loading && (
          <div className="mb-4">
            <Select value={targetLang} onValueChange={(v) => { setTargetLang(v); setResponse(null); setLoading(true); }}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

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
