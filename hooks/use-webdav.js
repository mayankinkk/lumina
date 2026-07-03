"use client";

import { useState, useCallback } from "react";
import useStore from "@/lib/store";

export function useWebdav() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [config, setConfigState] = useState(() => {
    if (typeof window === "undefined") return { url: "", username: "", password: "" };
    try {
      const stored = localStorage.getItem("lumina_webdav");
      return stored ? JSON.parse(stored) : { url: "", username: "", password: "" };
    } catch {
      return { url: "", username: "", password: "" };
    }
  });

  const setConfig = useCallback((c) => {
    setConfigState(c);
    try {
      localStorage.setItem("lumina_webdav", JSON.stringify(c));
    } catch {}
  }, []);

  const clearConfig = useCallback(() => {
    setConfig({ url: "", username: "", password: "" });
    try {
      localStorage.removeItem("lumina_webdav");
    } catch {}
  }, []);

  const backupToWebdav = useCallback(async () => {
    if (!config.url) throw new Error("WebDAV URL not configured");
    const { books, vocabulary, notes, highlights, readingSessions } = useStore.getState();
    const data = {
      books: books.map(({ fileData, textContent, ...b }) => b),
      vocabulary,
      notes,
      highlights,
      readingSessions,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    setSyncing(true);
    try {
      const filename = `lumina-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const uploadUrl = `${config.url.replace(/\/?$/, "/")}${filename}`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${config.username}:${config.password}`),
        },
        body: blob,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      setLastSync(new Date().toISOString());
      return true;
    } finally {
      setSyncing(false);
    }
  }, [config]);

  const restoreFromWebdav = useCallback(async (filename) => {
    if (!config.url) throw new Error("WebDAV URL not configured");

    setSyncing(true);
    try {
      const downloadUrl = `${config.url.replace(/\/?$/, "/")}${filename}`;
      const res = await fetch(downloadUrl, {
        headers: {
          Authorization: "Basic " + btoa(`${config.username}:${config.password}`),
        },
      });

      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const data = await res.json();
      return data;
    } finally {
      setSyncing(false);
    }
  }, [config]);

  const listBackups = useCallback(async () => {
    if (!config.url) throw new Error("WebDAV URL not configured");

    setSyncing(true);
    try {
      const dirUrl = config.url.replace(/\/?$/, "/");
      const res = await fetch(dirUrl, {
        method: "PROPFIND",
        headers: {
          Authorization: "Basic " + btoa(`${config.username}:${config.password}`),
          Depth: "1",
        },
      });

      if (!res.ok) throw new Error(`List failed: ${res.status}`);
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");
      const responses = xml.querySelectorAll("D\\:response, response");
      const files = [];

      responses.forEach((resp) => {
        const href = resp.querySelector("D\\:href, href")?.textContent || "";
        if (!href.endsWith(".json")) return;
        const displayName = resp.querySelector("D\\:displayname, displayname")?.textContent || href.split("/").pop();
        const getLastModified = resp.querySelector("D\\:getlastmodified, getlastmodified")?.textContent || "";
        files.push({ href, displayName, lastModified: getLastModified });
      });

      return files;
    } finally {
      setSyncing(false);
    }
  }, [config]);

  return {
    config,
    setConfig,
    clearConfig,
    syncing,
    lastSync,
    backupToWebdav,
    restoreFromWebdav,
    listBackups,
    isConfigured: !!config.url,
  };
}