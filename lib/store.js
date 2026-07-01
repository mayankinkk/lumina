"use client";

import { create } from "zustand";
import { mockBooks, mockVocabulary, mockNotes } from "./mock-data";

const useStore = create((set, get) => ({
  books: mockBooks,
  vocabulary: mockVocabulary,
  notes: mockNotes,
  searchQuery: "",
  viewMode: "grid",
  sidebarOpen: false,
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  pdfDocument: null,
  highlights: [],
  selectedText: "",
  contextMenuPosition: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(50, zoom)) }),
  setPdfDocument: (doc) => set({ pdfDocument: doc }),

  addBook: (book) => set((s) => ({ books: [...s.books, book] })),
  removeBook: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id) })),
  updateBookProgress: (id, progress, currentPage) =>
    set((s) => ({
      books: s.books.map((b) =>
        b.id === id ? { ...b, progress, currentPage, lastOpened: new Date().toISOString() } : b
      ),
    })),

  setSelectedText: (text) => set({ selectedText: text }),
  setContextMenuPosition: (pos) => set({ contextMenuPosition: pos }),

  addHighlight: (highlight) =>
    set((s) => ({ highlights: [...s.highlights, highlight] })),
  removeHighlight: (id) =>
    set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) })),
  updateHighlight: (id, updates) =>
    set((s) => ({
      highlights: s.highlights.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),

  addNote: (note) => set((s) => ({ notes: [...s.notes, note] })),
  updateNote: (id, updates) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  addVocabularyWord: (word) =>
    set((s) => ({ vocabulary: [...s.vocabulary, word] })),
  removeVocabularyWord: (id) =>
    set((s) => ({ vocabulary: s.vocabulary.filter((w) => w.id !== id) })),
  updateVocabularyWord: (id, updates) =>
    set((s) => ({
      vocabulary: s.vocabulary.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  getFilteredBooks: () => {
    const { books, searchQuery } = get();
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  },

  getDueVocabulary: () => {
    const { vocabulary } = get();
    const now = new Date();
    return vocabulary.filter((w) => new Date(w.nextReview) <= now);
  },
}));

export default useStore;
