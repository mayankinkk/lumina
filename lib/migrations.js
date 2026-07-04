"use client";

const DB_NAME = "lumina";
const DB_VERSION = 1;
const MIGRATION_KEY = "lumina_db_version";

const migrations = [
  {
    version: 1,
    description: "Initial schema",
    up: () => {},
  },
  {
    version: 2,
    description: "Add collections support to books",
    up: (data) => {
      if (data.books) {
        data.books = data.books.map((b) => ({ ...b, collections: b.collections || [] }));
      }
    },
  },
  {
    version: 3,
    description: "Add word mastery tracking fields",
    up: (data) => {
      if (data.vocabulary) {
        data.vocabulary = data.vocabulary.map((w) => ({
          ...w,
          reviewCount: w.reviewCount || 0,
          lastReviewed: w.lastReviewed || null,
        }));
      }
    },
  },
];

function getCurrentVersion() {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(MIGRATION_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function setCurrentVersion(version) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MIGRATION_KEY, String(version));
}

export async function runMigrations(data) {
  const currentVersion = getCurrentVersion();
  let migrated = { ...data };

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      try {
        migration.up(migrated);
        setCurrentVersion(migration.version);
      } catch (err) {
        console.error(`Migration v${migration.version} failed:`, err);
      }
    }
  }

  return migrated;
}

export function getMigrationInfo() {
  return {
    currentVersion: getCurrentVersion(),
    latestVersion: migrations.length,
    pendingMigrations: migrations.filter((m) => m.version > getCurrentVersion()).map((m) => ({
      version: m.version,
      description: m.description,
    })),
  };
}

export async function resetMigrations() {
  setCurrentVersion(0);
}
