"use client";

import { useState, useCallback } from "react";

export function useDictionary() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = useCallback(async (word) => {
    if (!word || word.length < 2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Free Dictionary API
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error("Word not found");

      const data = await res.json();
      const entry = data[0];

      if (!entry) throw new Error("No results");

      const meanings = [];

      for (const m of entry.meanings || []) {
        const partOfSpeech = m.partOfSpeech;
        for (const def of m.definitions || []) {
          meanings.push({
            partOfSpeech,
            definition: def.definition,
            example: def.example,
            synonyms: (def.synonyms || []).slice(0, 5),
            antonyms: (def.antonyms || []).slice(0, 5),
          });
        }
      }

      setResult({
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || "",
        audio: entry.phonetics?.[0]?.audio || "",
        meanings,
      });
    } catch (err) {
      setError(err.message === "Word not found" ? `"${word}" not found in dictionary` : "Dictionary lookup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, lookup, clear };
}