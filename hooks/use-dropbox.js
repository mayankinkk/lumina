"use client";

export function useDropbox() {
  return {
    connected: false,
    connecting: false,
    backup: async () => {
      throw new Error("Not implemented");
    },
    restore: async () => {
      throw new Error("Not implemented");
    },
  };
}
