"use client";

import { create } from "zustand";
import { get, set, del, keys } from "idb-keyval";

const FILE_STORE_PREFIX = "lumina_file_";
const STORAGE_KEYS = {
  books: "lumina_books",
  vocabulary: "lumina_vocabulary",
  notes: "lumina_notes",
  highlights: "lumina_highlights",
  sessions: "lumina_sessions",
};

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
    }
  }
}

function stripFileData(book) {
  const { fileData, textContent, ...meta } = book;
  return meta;
}

async function saveFileToIndexedDB(id, data) {
  try {
    const buffer = data instanceof ArrayBuffer ? data.slice(0) : data;
    await set(`${FILE_STORE_PREFIX}${id}`, buffer);
  } catch {
  }
}

async function loadFileFromIndexedDB(id) {
  try {
    const data = await get(`${FILE_STORE_PREFIX}${id}`);
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (data instanceof Uint8Array) return data;
    return data;
  } catch {
    return null;
  }
}

async function removeFileFromIndexedDB(id) {
  try {
    await del(`${FILE_STORE_PREFIX}${id}`);
  } catch {}
}

const useStore = create((set, get) => ({
  books: [],
  vocabulary: [],
  notes: [],
  highlights: [],
  readingSessions: [],
  fileCache: {},
  sidebarOpen: false,
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  dailyGoal: 20,
  autoScrollMode: "off",
  autoScrollSpeed: 5,
  pageAnimation: "none",
  pageAnimationSpeed: 300,
  _hydrated: false,

  hydrate: async () => {
    if (get()._hydrated) return;
    const books = loadFromStorage(STORAGE_KEYS.books, []);
    const vocabulary = loadFromStorage(STORAGE_KEYS.vocabulary, []);
    const notes = loadFromStorage(STORAGE_KEYS.notes, []);
    const highlights = loadFromStorage(STORAGE_KEYS.highlights, []);
    const readingSessions = loadFromStorage(STORAGE_KEYS.sessions, []);
    const dailyGoal = loadFromStorage("lumina_daily_goal", 20);

    const fileCache = {};
    for (const book of books) {
      const data = await loadFileFromIndexedDB(book.id);
      if (data) fileCache[book.id] = data;
    }

    set({ books, vocabulary, notes, highlights, readingSessions, dailyGoal, fileCache, _hydrated: true });
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(50, zoom)) }),
  setDailyGoal: (goal) => {
    saveToStorage("lumina_daily_goal", goal);
    set({ dailyGoal: goal });
  },
  setAutoScrollMode: (mode) => set({ autoScrollMode: mode }),
  setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: Math.min(10, Math.max(1, speed)) }),
  setPageAnimation: (animation) => set({ pageAnimation: animation }),
  setPageAnimationSpeed: (speed) => set({ pageAnimationSpeed: Math.min(800, Math.max(100, speed)) }),

  addBook: (book) => {
    const meta = stripFileData(book);
    const updated = [...get().books, meta];
    saveToStorage(STORAGE_KEYS.books, updated);
    const cache = { ...get().fileCache };
    if (book.fileData) {
      const copy = book.fileData.slice(0);
      cache[book.id] = copy;
      saveFileToIndexedDB(book.id, copy);
    }
    if (book.textContent) {
      cache[book.id] = book.textContent;
      saveFileToIndexedDB(book.id, book.textContent);
    }
    set({ books: updated, fileCache: cache });
  },

  removeBook: (id) => {
    const updated = get().books.filter((b) => b.id !== id);
    saveToStorage(STORAGE_KEYS.books, updated);
    const cache = { ...get().fileCache };
    delete cache[id];
    removeFileFromIndexedDB(id);
    set({ books: updated, fileCache: cache });
  },

  updateBook: (id, updates) => {
    const updated = get().books.map((b) => (b.id === id ? { ...b, ...updates } : b));
    saveToStorage(STORAGE_KEYS.books, updated);
    set({ books: updated });
  },

  loadFileData: (id) => {
    return get().fileCache[id] || null;
  },

  cacheFileData: (id, data) => {
    const cache = { ...get().fileCache };
    cache[id] = data;
    set({ fileCache: cache });
  },

  addHighlight: (highlight) => {
    const updated = [...get().highlights, highlight];
    saveToStorage(STORAGE_KEYS.highlights, updated);
    set({ highlights: updated });
  },

  removeHighlight: (id) => {
    const updated = get().highlights.filter((h) => h.id !== id);
    saveToStorage(STORAGE_KEYS.highlights, updated);
    set({ highlights: updated });
  },

  updateHighlight: (id, updates) => {
    const updated = get().highlights.map((h) => (h.id === id ? { ...h, ...updates } : h));
    saveToStorage(STORAGE_KEYS.highlights, updated);
    set({ highlights: updated });
  },

  addNote: (note) => {
    const updated = [...get().notes, note];
    saveToStorage(STORAGE_KEYS.notes, updated);
    set({ notes: updated });
  },

  updateNote: (id, updates) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    saveToStorage(STORAGE_KEYS.notes, updated);
    set({ notes: updated });
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    saveToStorage(STORAGE_KEYS.notes, updated);
    set({ notes: updated });
  },

  addVocabularyWord: (word) => {
    const existing = get().vocabulary.find(
      (w) => w.word.toLowerCase() === word.word.toLowerCase()
    );
    if (existing) return existing;
    const updated = [...get().vocabulary, word];
    saveToStorage(STORAGE_KEYS.vocabulary, updated);
    set({ vocabulary: updated });
    return word;
  },

  removeVocabularyWord: (id) => {
    const updated = get().vocabulary.filter((w) => w.id !== id);
    saveToStorage(STORAGE_KEYS.vocabulary, updated);
    set({ vocabulary: updated });
  },

  updateVocabularyWord: (id, updates) => {
    const updated = get().vocabulary.map((w) => (w.id === id ? { ...w, ...updates } : w));
    saveToStorage(STORAGE_KEYS.vocabulary, updated);
    set({ vocabulary: updated });
  },

  addReadingSession: (session) => {
    const updated = [...get().readingSessions, session];
    saveToStorage(STORAGE_KEYS.sessions, updated);
    set({ readingSessions: updated });
  },
}));

export default useStore;
