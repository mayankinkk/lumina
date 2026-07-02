"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function usePdfSearch(pdfDocRef) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const search = useCallback(async (q) => {
    const pdf = pdfDocRef.current;
    if (!pdf || !q || q.length < 2) {
      setResults([]);
      setCurrentIndex(-1);
      setQuery(q);
      return;
    }

    setQuery(q);
    setSearching(true);

    const matches = [];
    const lowerQ = q.toLowerCase();

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items;

        for (const item of items) {
          const str = item.str;
          if (!str) continue;

          let idx = str.toLowerCase().indexOf(lowerQ);
          while (idx !== -1) {
            matches.push({
              page: pageNum,
              text: str,
              index: idx,
              match: str.substring(idx, idx + q.length),
              item,
            });
            idx = str.toLowerCase().indexOf(lowerQ, idx + 1);
          }
        }
      } catch {}
    }

    setResults(matches);
    setCurrentIndex(matches.length > 0 ? 0 : -1);
    setSearching(false);
  }, [pdfDocRef]);

  const goToNext = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % results.length);
  }, [results]);

  const goToPrev = useCallback(() => {
    if (results.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setCurrentIndex(-1);
  }, []);

  return {
    query,
    results,
    currentIndex,
    currentResult: currentIndex >= 0 ? results[currentIndex] : null,
    searching,
    search,
    goToNext,
    goToPrev,
    clear,
    setQuery,
  };
}
