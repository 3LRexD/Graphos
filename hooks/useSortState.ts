/**
 * useSortState.ts
 * Toda la lógica de estado del visualizador de ordenamiento.
 * El componente de UI solo llama funciones de este hook.
 */
"use client";

import { useState, useCallback } from "react";
import {
  computeSort,
  type SortOutput,
  type SortResult,
  type SortAlgorithm,
} from "../algorithms/sort";

const EXAMPLE_SETS = [
  [38, 27, 43, 3, 9, 82, 10],
  [64, 34, 25, 12, 22, 11, 90],
  [5, 1, 4, 2, 8, 3, 7, 6],
];

export function useSortState() {
  const [values, setValues]         = useState<number[]>([]);
  const [inputText, setInputText]   = useState<string>("");
  const [algorithm, setAlgorithm]   = useState<SortAlgorithm>("bubble");
  const [result, setResult]         = useState<SortOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [playSpeed, setPlaySpeed]   = useState(600); // ms per step
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string, ms = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  // ── Agregar número ────────────────────────────────────────────────────────
  const addValue = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") return;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num)) {
      showToast("⚠ Solo se permiten números válidos.");
      return;
    }
    if (values.length >= 30) {
      showToast("⚠ Máximo 30 elementos.");
      return;
    }
    setValues(prev => [...prev, num]);
    setInputText("");
    setResult(null);
    setCurrentStep(0);
  }, [values.length]);

  // ── Eliminar número por índice ─────────────────────────────────────────────
  const removeValue = useCallback((idx: number) => {
    setValues(prev => prev.filter((_, i) => i !== idx));
    setResult(null);
    setCurrentStep(0);
  }, []);

  // ── Limpiar todo ──────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    setValues([]);
    setInputText("");
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  // ── Cargar ejemplo ────────────────────────────────────────────────────────
  const loadExample = useCallback((idx = 0) => {
    const ex = EXAMPLE_SETS[idx % EXAMPLE_SETS.length];
    setValues([...ex]);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setInputText("");
  }, []);

  // ── Resolver ──────────────────────────────────────────────────────────────
  const solve = useCallback(() => {
    if (values.length === 0) {
      showToast("⚠ Agrega al menos un número.");
      return;
    }
    const output = computeSort({ values, algorithm });
    if (output.error) {
      const msgs: Record<string, string> = {
        empty:          "⚠ El arreglo está vacío.",
        too_large:      "⚠ Máximo 30 elementos permitidos.",
        invalid_values: "⚠ Valores inválidos en el arreglo.",
      };
      showToast(msgs[output.reason] ?? "⚠ Error desconocido.");
      return;
    }
    setResult(output);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [values, algorithm]);

  // ── Navegación de pasos ───────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    if (!result || result.error) return;
    setCurrentStep(s => Math.min(s + 1, (result as SortResult).steps.length - 1));
  }, [result]);

  const prevStep = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((n: number) => {
    if (!result || result.error) return;
    const max = (result as SortResult).steps.length - 1;
    setCurrentStep(Math.max(0, Math.min(n, max)));
  }, [result]);

  // ── Reproducción automática ───────────────────────────────────────────────
  const play = useCallback(() => {
    if (!result || result.error) return;
    const r = result as SortResult;
    if (currentStep >= r.steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [result, currentStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    // Estado
    values, inputText, algorithm, result, currentStep,
    isPlaying, playSpeed, toast,
    // Acciones
    setInputText,
    setAlgorithm,
    setPlaySpeed,
    addValue,
    removeValue,
    clear,
    loadExample,
    solve,
    nextStep,
    prevStep,
    goToStep,
    play,
    pause,
    // Derivados
    totalValues: values.length,
  };
}