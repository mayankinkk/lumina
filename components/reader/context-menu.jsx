"use client";

import { useState } from "react";
import useStore from "@/lib/store";
import { AiDrawer } from "./ai-drawer";
import { useTts } from "@/hooks/use-tts";
import { useOfflineDictionary } from "@/hooks/use-offline-dictionary";
import { Loader2 } from "lucide-react";

const actions = [
  { label: "Define", icon: "📖", id: "define" },
  { label: "Explain", icon: "💡", id: "explain" },
  { label: "Translate", icon: "🌐", id: "translate" },
  { label: "Read", icon: "🔊", id: "read" },
  { label: "Dictionary", icon: "📕", id: "dictionary" },
  { label: "Highlight", icon: "🖍️", id: "highlight" },
  { label: "Underline", icon: "📄", id: "underline" },
  { label: "Strikethrough", icon: "✂️", id: "strikethrough" },
  { label: "Note", icon: "📝", id: "note" },
  { label: "Copy", icon: "📋", id: "copy" },
  { label: "Save", icon: "🔖", id: "save" },
];

export function ContextMenuPopup({ text, bookId }) {
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const addVocabularyWord = useStore((s) => s.addVocabularyWord);
  const addHighlight = useStore((s) => s.addHighlight);
  const addNote = useStore((s) => s.addNote);
  const { speak, stop, speaking } = useTts();
  const dict = useOfflineDictionary();

  const handleAction = (actionId) => {
    if (actionId === "copy") {
      navigator.clipboard.writeText(text);
    }
    if (actionId === "save") {
      const newWord = {
        id: crypto.randomUUID(),
        word: text,
        partOfSpeech: "Unknown",
        mastery: "B2",
        masteryLevel: 0,
        meaning: "",
        pronunciation: "",
        example: text,
        synonyms: [],
        antonyms: [],
        etymology: "",
        nextReview: new Date(Date.now() + 86400000).toISOString(),
        dateAdded: new Date().toISOString(),
      };
      addVocabularyWord(newWord);
      setActiveAction("define");
      setShowAiDrawer(true);
    }
    if (actionId === "highlight" || actionId === "underline" || actionId === "strikethrough") {
      const typeMap = { highlight: "highlight", underline: "underline", strikethrough: "strikethrough" };
      addHighlight({
        id: crypto.randomUUID(),
        bookId,
        text,
        type: typeMap[actionId] || "highlight",
        color: "#fde047",
        page: useStore.getState().currentPage,
        createdAt: new Date().toISOString(),
      });
    }
    if (actionId === "note") {
      addNote({
        id: crypto.randomUUID(),
        bookId,
        bookTitle: useStore.getState().books.find((b) => b.id === bookId)?.title || "",
        text,
        highlight: "highlight-yellow",
        page: useStore.getState().currentPage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#fde047",
      });
    }
    if (actionId === "read") {
      if (speaking) stop();
      speak(text);
    }
    if (actionId === "dictionary") {
      dict.lookup(text);
      setShowDict(true);
    }
    if (actionId === "define" || actionId === "explain" || actionId === "translate") {
      setActiveAction(actionId);
      setShowAiDrawer(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
        {actions.map((action) => (
          <button
            key={action.id}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent"
            onClick={() => handleAction(action.id)}
            aria-label={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {showAiDrawer && (
        <AiDrawer
          text={text}
          action={activeAction}
          onClose={() => {
            setShowAiDrawer(false);
            setActiveAction(null);
          }}
        />
      )}

      {showDict && (() => {
        const { result, loading, error, clear, source } = dict;
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center" onClick={() => { setShowDict(false); clear(); }}>
            <div className="w-full max-w-lg rounded-t-2xl border bg-background p-6 shadow-xl lg:rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Dictionary</h3>
                <div className="flex items-center gap-2">
                  {source && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${source === "offline" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                      {source === "offline" ? "Offline" : "Online"}
                    </span>
                  )}
                  <button onClick={() => { setShowDict(false); clear(); }} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
              </div>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div className="rounded-lg border-l-2 border-destructive bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {result && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-bold font-literata">{result.word}</p>
                    {result.phonetic && <p className="text-sm text-muted-foreground">{result.phonetic}</p>}
                    {result.audio && (
                      <audio controls className="mt-1 h-8 w-full max-w-[200px]">
                        <source src={result.audio} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {result.meanings.slice(0, 6).map((m, i) => (
                      <div key={i} className="rounded-lg border-l-2 border-primary bg-primary/5 p-3">
                        <p className="text-xs font-medium text-primary uppercase mb-1">{m.partOfSpeech}</p>
                        <p className="text-sm">{m.definition}</p>
                        {m.example && <p className="mt-1 text-xs italic text-muted-foreground">&ldquo;{m.example}&rdquo;</p>}
                        {m.synonyms.length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">Synonyms: {m.synonyms.join(", ")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
