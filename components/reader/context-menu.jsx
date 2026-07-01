"use client";

import { useState } from "react";
import useStore from "@/lib/store";
import { AiDrawer } from "./ai-drawer";

const actions = [
  { label: "Define", icon: "📖", id: "define" },
  { label: "Explain", icon: "💡", id: "explain" },
  { label: "Translate", icon: "🌐", id: "translate" },
  { label: "Highlight", icon: "🖍️", id: "highlight" },
  { label: "Note", icon: "📝", id: "note" },
  { label: "Copy", icon: "📋", id: "copy" },
  { label: "Save", icon: "🔖", id: "save" },
];

export function ContextMenuPopup({ text, bookId }) {
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const addVocabularyWord = useStore((s) => s.addVocabularyWord);
  const addHighlight = useStore((s) => s.addHighlight);
  const addNote = useStore((s) => s.addNote);

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
    if (actionId === "highlight") {
      addHighlight({
        id: crypto.randomUUID(),
        bookId,
        text,
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
    </>
  );
}
