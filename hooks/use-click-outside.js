"use client";

import { useEffect, useRef } from "react";

export function useClickOutside(enabled, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [enabled, onClose]);

  return ref;
}
