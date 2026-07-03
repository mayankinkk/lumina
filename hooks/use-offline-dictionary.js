"use client";

import { useState, useCallback, useEffect } from "react";
import { get, set, del } from "idb-keyval";

const DICT_KEY = "lumina_offline_dict";

export function useOfflineDictionary() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasDictionary, setHasDictionary] = useState(false);
  const [dictionarySize, setDictionarySize] = useState(0);
  const [source, setSource] = useState(null);
  const [offlineLoading, setOfflineLoading] = useState(false);

  useEffect(() => {
    checkDictionary();
  }, []);

  const checkDictionary = async () => {
    try {
      const data = await get(DICT_KEY);
      if (data) {
        const size = Object.keys(data).length;
        setHasDictionary(true);
        setDictionarySize(size);
      } else {
        setHasDictionary(false);
        setDictionarySize(0);
      }
    } catch {
      setHasDictionary(false);
      setDictionarySize(0);
    }
  };

  const lookup = useCallback(async (word) => {
    if (!word || word.length < 2) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSource(null);

    try {
      const dict = await get(DICT_KEY);
      const entry = dict?.[word.toLowerCase()];
      if (entry) {
        setResult({
          word: entry.word || word,
          phonetic: entry.phonetic || "",
          audio: entry.audio || "",
          meanings: (entry.definitions || []).map((d) => ({
            partOfSpeech: d.partOfSpeech,
            definition: d.definition,
            example: d.example || "",
            synonyms: d.synonyms || [],
            antonyms: d.antonyms || [],
          })),
        });
        setSource("offline");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      if (!res.ok) throw new Error("Word not found");
      const data = await res.json();
      const entryApi = data[0];
      if (!entryApi) throw new Error("No results");

      const meanings = [];
      for (const m of entryApi.meanings || []) {
        for (const def of m.definitions || []) {
          meanings.push({
            partOfSpeech: m.partOfSpeech,
            definition: def.definition,
            example: def.example,
            synonyms: (def.synonyms || []).slice(0, 5),
            antonyms: (def.antonyms || []).slice(0, 5),
          });
        }
      }

      setResult({
        word: entryApi.word,
        phonetic: entryApi.phonetic || entryApi.phonetics?.[0]?.text || "",
        audio: entryApi.phonetics?.[0]?.audio || "",
        meanings,
      });
      setSource("online");
    } catch (err) {
      setError(
        err.message === "Word not found"
          ? `"${word}" not found in dictionary`
          : "Dictionary lookup failed"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadDictionary = useCallback(async () => {
    setOfflineLoading(true);
    try {
      const res = await fetch("/dictionary/dictionary.json");
      if (!res.ok) throw new Error("Failed to download dictionary");
      const data = await res.json();
      await set(DICT_KEY, data);
      const size = Object.keys(data).length;
      setHasDictionary(true);
      setDictionarySize(size);
    } catch (err) {
      setError(err.message || "Failed to download dictionary");
    } finally {
      setOfflineLoading(false);
    }
  }, []);

  const deleteDictionary = useCallback(async () => {
    try {
      await del(DICT_KEY);
      setHasDictionary(false);
      setDictionarySize(0);
    } catch {
      // ignore
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setSource(null);
  }, []);

  return {
    result,
    loading,
    error,
    lookup,
    clear,
    hasDictionary,
    dictionarySize,
    downloadDictionary,
    deleteDictionary,
    offlineLoading,
    source,
  };
}
