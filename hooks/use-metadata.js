"use client";

import { useState, useCallback } from "react";

export function useMetadata() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupByTitle = useCallback(async (title) => {
    if (!title || title.length < 2) return null;

    setLoading(true);
    setError(null);

    try {
      const openRes = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1`
      );
      if (openRes.ok) {
        const openData = await openRes.json();
        const doc = openData.docs?.[0];
        if (doc) {
          const coverId = doc.cover_i;
          setLoading(false);
          return {
            title: doc.title || title,
            author: doc.author_name?.[0] || null,
            coverUrl: coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
              : null,
            description: doc.first_sentence?.[0] || null,
            isbn: doc.isbn?.[0] || null,
          };
        }
      }

      const googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`
      );
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        const item = googleData.items?.[0];
        if (item) {
          const info = item.volumeInfo;
          const isbn = info.industryIdentifiers?.[0]?.identifier || null;
          return {
            title: info.title || title,
            author: info.authors?.[0] || null,
            coverUrl: info.imageLinks?.thumbnail?.replace("http:", "https:") || null,
            description: info.description || null,
            isbn,
          };
        }
      }

      setLoading(false);
      return null;
    } catch (err) {
      setError("Metadata lookup failed");
      setLoading(false);
      return null;
    }
  }, []);

  return { loading, error, lookupByTitle };
}
