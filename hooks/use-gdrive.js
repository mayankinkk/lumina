"use client";

export function useGdrive() {
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
