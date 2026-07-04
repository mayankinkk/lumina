"use client";

import { useCallback, useRef } from "react";
import useStore from "@/lib/store";

export function useUndoRedo() {
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxSize = 50;

  const push = useCallback((action) => {
    undoStack.current.push(action);
    if (undoStack.current.length > maxSize) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const action = undoStack.current.pop();
    if (!action) return;
    action.undo();
    redoStack.current.push(action);
  }, []);

  const redo = useCallback(() => {
    const action = redoStack.current.pop();
    if (!action) return;
    action.redo();
    undoStack.current.push(action);
  }, []);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  const addHighlight = useCallback((highlight) => {
    push({
      undo: () => useStore.getState().removeHighlight(highlight.id),
      redo: () => useStore.getState().addHighlight(highlight),
    });
  }, [push]);

  const removeHighlight = useCallback((id) => {
    const highlight = useStore.getState().highlights.find((h) => h.id === id);
    if (!highlight) return;
    push({
      undo: () => useStore.getState().addHighlight(highlight),
      redo: () => useStore.getState().removeHighlight(id),
    });
    useStore.getState().removeHighlight(id);
  }, [push]);

  const addNote = useCallback((note) => {
    push({
      undo: () => useStore.getState().deleteNote(note.id),
      redo: () => useStore.getState().addNote(note),
    });
  }, [push]);

  const deleteNote = useCallback((id) => {
    const note = useStore.getState().notes.find((n) => n.id === id);
    if (!note) return;
    push({
      undo: () => useStore.getState().addNote(note),
      redo: () => useStore.getState().deleteNote(id),
    });
    useStore.getState().deleteNote(id);
  }, [push]);

  return { undo, redo, canUndo, canRedo, addHighlight, removeHighlight, addNote, deleteNote };
}
