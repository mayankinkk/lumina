"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useTts() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const loadVoices = () => {
      const available = synth.getVoices();
      if (available.length > 0) {
        setVoices(available);
        if (!voice) setVoice(available[0]);
      }
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, [voice]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const handleEnd = () => {
      setSpeaking(false);
      setPaused(false);
    };

    const checkSpeaking = setInterval(() => {
      if (!synth.speaking && speaking) {
        setSpeaking(false);
        setPaused(false);
      }
    }, 200);

    return () => clearInterval(checkSpeaking);
  }, [speaking]);

  const speak = useCallback((text) => {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    if (voice) utterance.voice = voice;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };

    synth.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  }, [rate, voice]);

  const pause = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.paused) {
      synth.resume();
      setPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!speaking) return;
    if (paused) resume();
    else pause();
  }, [speaking, paused, resume, pause]);

  return {
    speaking,
    paused,
    rate,
    setRate,
    voice,
    setVoice,
    voices,
    speak,
    pause,
    resume,
    stop,
    togglePlayPause,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
  };
}
