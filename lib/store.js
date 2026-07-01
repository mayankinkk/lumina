"use client";

import { create } from "zustand";

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
  } catch {}
}

const initial = {
  books: [],
  vocabulary: [],
  notes: [],
  highlights: [],
  readingSessions: [],
  sidebarOpen: false,
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
};

const useStore = create((set, get) => ({
  ...initial,

  _hydrated: false,
  hydrate: () => {
    if (get()._hydrated) return;
    const books = loadFromStorage("lumina_books", []);
    const vocabulary = loadFromStorage("lumina_vocabulary", []);
    const notes = loadFromStorage("lumina_notes", []);
    const highlights = loadFromStorage("lumina_highlights", []);
    const readingSessions = loadFromStorage("lumina_sessions", []);
    set({ books, vocabulary, notes, highlights, readingSessions, _hydrated: true });
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(50, zoom)) }),

  addBook: (book) => {
    const updated = [...get().books, book];
    saveToStorage("lumina_books", updated);
    set({ books: updated });
  },

  removeBook: (id) => {
    const updated = get().books.filter((b) => b.id !== id);
    saveToStorage("lumina_books", updated);
    set({ books: updated });
  },

  updateBook: (id, updates) => {
    const updated = get().books.map((b) => (b.id === id ? { ...b, ...updates } : b));
    saveToStorage("lumina_books", updated);
    set({ books: updated });
  },

  addHighlight: (highlight) => {
    const updated = [...get().highlights, highlight];
    saveToStorage("lumina_highlights", updated);
    set({ highlights: updated });
  },

  removeHighlight: (id) => {
    const updated = get().highlights.filter((h) => h.id !== id);
    saveToStorage("lumina_highlights", updated);
    set({ highlights: updated });
  },

  updateHighlight: (id, updates) => {
    const updated = get().highlights.map((h) => (h.id === id ? { ...h, ...updates } : h));
    saveToStorage("lumina_highlights", updated);
    set({ highlights: updated });
  },

  addNote: (note) => {
    const updated = [...get().notes, note];
    saveToStorage("lumina_notes", updated);
    set({ notes: updated });
  },

  updateNote: (id, updates) => {
    const updated = get().notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    saveToStorage("lumina_notes", updated);
    set({ notes: updated });
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    saveToStorage("lumina_notes", updated);
    set({ notes: updated });
  },

  addVocabularyWord: (word) => {
    const updated = [...get().vocabulary, word];
    saveToStorage("lumina_vocabulary", updated);
    set({ vocabulary: updated });
  },

  removeVocabularyWord: (id) => {
    const updated = get().vocabulary.filter((w) => w.id !== id);
    saveToStorage("lumina_vocabulary", updated);
    set({ vocabulary: updated });
  },

  updateVocabularyWord: (id, updates) => {
    const updated = get().vocabulary.map((w) => (w.id === id ? { ...w, ...updates } : w));
    saveToStorage("lumina_vocabulary", updated);
    set({ vocabulary: updated });
  },

  addReadingSession: (session) => {
    const updated = [...get().readingSessions, session];
    saveToStorage("lumina_sessions", updated);
    set({ readingSessions: updated });
  },
}));

export default useStore;
