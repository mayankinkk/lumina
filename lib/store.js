"use client";

import { create } from "zustand";
import { get, set, del, keys } from "idb-keyval";

const FILE_STORE_PREFIX = "lumina_file_";
const COVER_STORE_PREFIX = "lumina_cover_";
const STORAGE_KEYS = {
  books: "lumina_books",
  vocabulary: "lumina_vocabulary",
  notes: "lumina_notes",
  highlights: "lumina_highlights",
  sessions: "lumina_sessions",
  bookmarks: "lumina_bookmarks",
  readingQueue: "lumina_reading_queue",
  readerPresets: "lumina_reader_presets",
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

async function saveCoverToIndexedDB(id, dataUrl) {
  try {
    await set(`${COVER_STORE_PREFIX}${id}`, dataUrl);
  } catch {
  }
}

async function loadCoverFromIndexedDB(id) {
  try {
    return await get(`${COVER_STORE_PREFIX}${id}`);
  } catch {
    return null;
  }
}

async function removeCoverFromIndexedDB(id) {
  try {
    await del(`${COVER_STORE_PREFIX}${id}`);
  } catch {}
}

const useStore = create((set, get) => ({
  books: [],
  vocabulary: [],
  notes: [],
  highlights: [],
  readingSessions: [],
  bookmarks: [],
  readingQueue: [],
  fileCache: {},
  sidebarOpen: false,
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  dailyGoal: 20,
  weeklyGoal: 120,
  goalMode: "pages",
  autoScrollMode: "off",
  autoScrollSpeed: 5,
  pageAnimation: "none",
  pageAnimationSpeed: 300,
  blueLightFilter: 0,
  readingRuler: false,
  readingRulerStyle: "line",
  dualPageMode: false,
  readerFontFamily: "literata",
  readerFontSize: 18,
  readerLineHeight: 1.8,
  readerLetterSpacing: 0,
  readerFontWeight: 400,
  readerHyphenation: false,
  readerJustify: false,
  swipeThreshold: 30,
  readerTheme: "default",
  readerBackground: "default",
  customThemeColors: null,
  _hydrated: false,
  tapZones: [],
  searchQuery: "",
  searchResults: [],
  searchCurrentIndex: -1,
  epubRendition: null,
  epubToc: null,
  autoHideToolbar: false,
  readerPresets: [],

  hydrate: async () => {
    if (get()._hydrated) return;
    const books = loadFromStorage(STORAGE_KEYS.books, []);
    const vocabulary = loadFromStorage(STORAGE_KEYS.vocabulary, []);
    const notes = loadFromStorage(STORAGE_KEYS.notes, []);
    const highlights = loadFromStorage(STORAGE_KEYS.highlights, []);
    const readingSessions = loadFromStorage(STORAGE_KEYS.sessions, []);
    const bookmarks = loadFromStorage(STORAGE_KEYS.bookmarks, []);
    const readingQueue = loadFromStorage(STORAGE_KEYS.readingQueue, []);
    const dailyGoal = loadFromStorage("lumina_daily_goal", 20);
    const weeklyGoal = loadFromStorage("lumina_weekly_goal", 120);
    const goalMode = loadFromStorage("lumina_goal_mode", "pages");
    const customThemeColors = loadFromStorage("lumina_custom_theme_colors", null);
    const autoHideToolbar = loadFromStorage("lumina_auto_hide_toolbar", false);
    const tapZones = loadFromStorage("lumina_tap_zones", [
      { id: "l", position: "left", action: "prevPage" },
      { id: "c", position: "center", action: "none" },
      { id: "r", position: "right", action: "nextPage" },
    ]);
    const readerPresets = loadFromStorage(STORAGE_KEYS.readerPresets, []);

    const fileCache = {};
    for (const book of books) {
      const data = await loadFileFromIndexedDB(book.id);
      if (data) fileCache[book.id] = data;
    }

    set({ books, vocabulary, notes, highlights, readingSessions, bookmarks, readingQueue, dailyGoal, weeklyGoal, goalMode, customThemeColors, autoHideToolbar, tapZones, readerPresets, fileCache, _hydrated: true });
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
  setWeeklyGoal: (goal) => {
    saveToStorage("lumina_weekly_goal", goal);
    set({ weeklyGoal: goal });
  },
  setGoalMode: (mode) => {
    saveToStorage("lumina_goal_mode", mode);
    set({ goalMode: mode });
  },
  setAutoScrollMode: (mode) => set({ autoScrollMode: mode }),
  setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: Math.min(10, Math.max(1, speed)) }),
  setPageAnimation: (animation) => set({ pageAnimation: animation }),
  setPageAnimationSpeed: (speed) => set({ pageAnimationSpeed: Math.min(800, Math.max(100, speed)) }),
  setBlueLightFilter: (level) => set({ blueLightFilter: Math.min(95, Math.max(0, level)) }),
  setReadingRuler: (on) => set({ readingRuler: on }),
  setReadingRulerStyle: (style) => set({ readingRulerStyle: style }),
  setDualPageMode: (on) => set({ dualPageMode: on }),
  setReaderFontFamily: (family) => set({ readerFontFamily: family }),
  setReaderFontSize: (size) => set({ readerFontSize: Math.min(36, Math.max(12, size)) }),
  setReaderLineHeight: (lh) => set({ readerLineHeight: Math.min(3, Math.max(1, lh)) }),
  setReaderLetterSpacing: (ls) => set({ readerLetterSpacing: Math.min(4, Math.max(0, ls)) }),
  setReaderFontWeight: (w) => set({ readerFontWeight: Math.min(700, Math.max(300, Math.round(w / 100) * 100)) }),
  setEpubRendition: (rendition) => set({ epubRendition: rendition }),
  setEpubToc: (toc) => set({ epubToc: toc }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchCurrentIndex: (i) => set({ searchCurrentIndex: i }),
  setReaderHyphenation: (on) => set({ readerHyphenation: on }),
  setReaderJustify: (on) => set({ readerJustify: on }),
  setSwipeThreshold: (px) => set({ swipeThreshold: Math.min(100, Math.max(10, px)) }),
  setReaderTheme: (theme) => set({ readerTheme: theme }),
  setReaderBackground: (bg) => set({ readerBackground: bg }),
  setCustomThemeColors: (colors) => {
    saveToStorage("lumina_custom_theme_colors", colors);
    set({ customThemeColors: colors });
  },

  addTagToBook: (bookId, tag) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const tags = [...(book.tags || []), tag];
    get().updateBook(bookId, { tags });
  },

  removeTagFromBook: (bookId, tag) => {
    const book = get().books.find((b) => b.id === bookId);
    if (!book) return;
    const tags = (book.tags || []).filter((t) => t !== tag);
    get().updateBook(bookId, { tags });
  },

  getAllTags: () => {
    const allTags = new Set();
    get().books.forEach((b) => (b.tags || []).forEach((t) => allTags.add(t)));
    return Array.from(allTags).sort();
  },

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
    removeCoverFromIndexedDB(id);
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

  saveCover: async (id, dataUrl) => {
    await saveCoverToIndexedDB(id, dataUrl);
  },

  loadCover: async (id) => {
    return await loadCoverFromIndexedDB(id);
  },

  removeCover: async (id) => {
    await removeCoverFromIndexedDB(id);
  },

  addAnnotation: (annotation) => {
    const updated = [...get().highlights, annotation];
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

  addHighlight: (highlight) => {
    const updated = [...get().highlights, highlight];
    saveToStorage(STORAGE_KEYS.highlights, updated);
    set({ highlights: updated });
  },

  addNote: (note) => {
    const updated = [...get().notes, note];
    saveToStorage(STORAGE_KEYS.notes, updated);
    set({ notes: updated });
  },

  addBookmark: (bookmark) => {
    const updated = [...get().bookmarks, bookmark];
    saveToStorage(STORAGE_KEYS.bookmarks, updated);
    set({ bookmarks: updated });
  },

  addToReadingQueue: (bookId) => {
    const queue = get().readingQueue;
    if (queue.includes(bookId)) return;
    const updated = [...queue, bookId];
    saveToStorage(STORAGE_KEYS.readingQueue, updated);
    set({ readingQueue: updated });
  },

  removeFromReadingQueue: (bookId) => {
    const updated = get().readingQueue.filter((id) => id !== bookId);
    saveToStorage(STORAGE_KEYS.readingQueue, updated);
    set({ readingQueue: updated });
  },

  reorderReadingQueue: (fromIndex, toIndex) => {
    const queue = [...get().readingQueue];
    const [moved] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, moved);
    saveToStorage(STORAGE_KEYS.readingQueue, queue);
    set({ readingQueue: queue });
  },

  getNextInQueue: (bookId) => {
    const queue = get().readingQueue;
    const idx = queue.indexOf(bookId);
    if (idx !== -1 && idx < queue.length - 1) return queue[idx + 1];
    return null;
  },

  removeBookmark: (id) => {
    const updated = get().bookmarks.filter((b) => b.id !== id);
    saveToStorage(STORAGE_KEYS.bookmarks, updated);
    set({ bookmarks: updated });
  },

  getBookmarksForBook: (bookId) => {
    return get().bookmarks.filter((b) => b.bookId === bookId);
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

  logReadingSession: (session) => {
    get().addReadingSession({ ...session, id: crypto.randomUUID() });
  },

  getBookStats: (bookId) => {
    const sessions = get().readingSessions.filter((s) => s.bookId === bookId);
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const dates = sessions.map((s) => s.date).filter(Boolean).sort();
    const lastRead = dates.length > 0 ? dates[dates.length - 1] : null;
    const avgPagesPerSession = totalSessions > 0 ? Math.round(totalPagesRead / totalSessions) : 0;
    const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    return { totalSessions, totalMinutes, totalPagesRead, lastRead, avgPagesPerSession, avgMinutesPerSession };
  },

  setTapZones: (zones) => {
    saveToStorage("lumina_tap_zones", zones);
    set({ tapZones: zones });
  },

  setAutoHideToolbar: (on) => {
    saveToStorage("lumina_auto_hide_toolbar", on);
    set({ autoHideToolbar: on });
  },

  savePreset: (name) => {
    const state = get();
    const preset = {
      name,
      readerTheme: state.readerTheme,
      readerBackground: state.readerBackground,
      readerFontFamily: state.readerFontFamily,
      readerFontSize: state.readerFontSize,
      readerLineHeight: state.readerLineHeight,
      readerJustify: state.readerJustify,
      zoom: state.zoom,
      dualPageMode: state.dualPageMode,
      blueLightFilter: state.blueLightFilter,
      hyphenation: state.readerHyphenation,
    };
    const updated = [...state.readerPresets.filter((p) => p.name !== name), preset];
    saveToStorage(STORAGE_KEYS.readerPresets, updated);
    set({ readerPresets: updated });
  },

  loadPreset: (name) => {
    const preset = get().readerPresets.find((p) => p.name === name);
    if (!preset) return;
    set({
      readerTheme: preset.readerTheme,
      readerBackground: preset.readerBackground,
      readerFontFamily: preset.readerFontFamily,
      readerFontSize: preset.readerFontSize,
      readerLineHeight: preset.readerLineHeight,
      readerJustify: preset.readerJustify,
      zoom: preset.zoom,
      dualPageMode: preset.dualPageMode,
      blueLightFilter: preset.blueLightFilter,
      readerHyphenation: preset.hyphenation,
    });
  },

  deletePreset: (name) => {
    const updated = get().readerPresets.filter((p) => p.name !== name);
    saveToStorage(STORAGE_KEYS.readerPresets, updated);
    set({ readerPresets: updated });
  },

  getPresets: () => {
    return get().readerPresets;
  },
}));

export default useStore;
