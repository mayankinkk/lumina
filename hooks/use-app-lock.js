"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lumina_app_lock";

export function useAppLock() {
  const [config, setConfigState] = useState(() => {
    if (typeof window === "undefined") return { enabled: false, password: "", biometrics: false };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { enabled: false, password: "", biometrics: false };
    } catch {
      return { enabled: false, password: "", biometrics: false };
    }
  });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (config.enabled) setLocked(true);
  }, [config.enabled]);

  const setConfig = useCallback((c) => {
    setConfigState(c);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {}
  }, []);

  const enable = useCallback((password) => {
    setConfig({ enabled: true, password, useBiometrics: false });
  }, [setConfig]);

  const disable = useCallback(() => {
    setConfig({ enabled: false, password: "", useBiometrics: false });
    setLocked(false);
  }, [setConfig]);

  const unlock = useCallback((password) => {
    if (password === config.password) {
      setLocked(false);
      return true;
    }
    return false;
  }, [config.password]);

  const lock = useCallback(() => {
    if (config.enabled) setLocked(true);
  }, [config.enabled]);

  return {
    enabled: config.enabled,
    locked,
    config,
    enable,
    disable,
    unlock,
    lock,
  };
}