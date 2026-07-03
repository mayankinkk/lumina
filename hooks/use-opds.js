"use client";

import { useState, useCallback } from "react";

export function useOpds() {
  const [catalogs, setCatalogs] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("lumina_opds_catalogs");
      return stored ? JSON.parse(stored) : [
        { id: "standard-ebooks", name: "Standard Ebooks", url: "https://standardebooks.org/opds" },
        { id: "gutemberg", name: "Project Gutenberg", url: "https://www.gutenberg.org/ebooks/search.opds" },
      ];
    } catch {
      return [
        { id: "standard-ebooks", name: "Standard Ebooks", url: "https://standardebooks.org/opds" },
      ];
    }
  });
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const saveCatalogs = useCallback((catalogs) => {
    setCatalogs(catalogs);
    try {
      localStorage.setItem("lumina_opds_catalogs", JSON.stringify(catalogs));
    } catch {}
  }, []);

  const addCatalog = useCallback((name, url) => {
    const id = crypto.randomUUID();
    const updated = [...catalogs, { id, name, url }];
    saveCatalogs(updated);
  }, [catalogs, saveCatalogs]);

  const removeCatalog = useCallback((id) => {
    const updated = catalogs.filter((c) => c.id !== id);
    saveCatalogs(updated);
  }, [catalogs, saveCatalogs]);

  const fetchFeed = useCallback(async (url, title) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/atom+xml, application/xml, text/xml" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      const entries = Array.from(xml.querySelectorAll("entry")).map((entry) => {
        const title = entry.querySelector("title")?.textContent || "Unknown";
        const summary = entry.querySelector("content")?.textContent || entry.querySelector("summary")?.textContent || "";
        const links = Array.from(entry.querySelectorAll("link")).map((link) => ({
          href: link.getAttribute("href"),
          type: link.getAttribute("type"),
          rel: link.getAttribute("rel"),
        }));
        const author = entry.querySelector("author > name")?.textContent || "Unknown Author";
        const id = entry.querySelector("id")?.textContent || crypto.randomUUID();

        // Determine if this is a navigation entry (sub-feed) or a book
        const isNav = links.some((l) => l.type === "application/atom+xml;profile=opds-catalog" || l.rel === "subsection" || (!l.type && l.rel === "subsection"));

        return { id, title, summary, links, author, isNav };
      });

      const feedTitle = xml.querySelector("feed > title")?.textContent || title || "Catalog";

      setBreadcrumbs((prev) => [...prev, { title: feedTitle, url }]);
      setFeed({ title: feedTitle, entries });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const navigateBack = useCallback(() => {
    if (breadcrumbs.length <= 1) {
      setFeed(null);
      setBreadcrumbs([]);
      return;
    }
    const updated = breadcrumbs.slice(0, -1);
    const previous = updated[updated.length - 1];
    setBreadcrumbs(updated);
    fetchFeed(previous.url, previous.title);
  }, [breadcrumbs, fetchFeed]);

  const resetFeed = useCallback(() => {
    setFeed(null);
    setBreadcrumbs([]);
    setError(null);
  }, []);

  return {
    catalogs,
    feed,
    loading,
    error,
    breadcrumbs,
    addCatalog,
    removeCatalog,
    fetchFeed,
    navigateBack,
    resetFeed,
  };
}