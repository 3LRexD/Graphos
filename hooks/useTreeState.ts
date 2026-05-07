/**
 * useBSTState.ts
 * Toda la lógica de estado del visualizador de BST.
 * El componente de UI solo llama funciones de este hook.
 */
"use client";
 
import { useState, useCallback, useRef, useEffect } from "react";
import {
  computeBSTBuild,
  computeTraversal,
  computeRebuild,
  type BSTNode,
  type BSTBuildResult,
  type TraversalResult,
  type RebuildResult,
  type TraversalType,
  type RebuildMode,
  type BSTOutput,
  type TraversalOutput,
  type RebuildOutput,
} from "../algorithms/tree";
 
// ─── Tab literal type ─────────────────────────────────────────────────────────
export type BSTTab = "build" | "traversal" | "rebuild";
 
// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBSTState() {
  // ── Input & build ──────────────────────────────────────────────────────────
  const [values, setValues]         = useState<number[]>([]);
  const valuesRef                   = useRef<number[]>([]); // always current, no stale closures
  const [inputText, setInputText]   = useState<string>("");
  const [buildResult, setBuildResult] = useState<BSTOutput | null>(null);
 
  // ── Navigation ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState<BSTTab>("build");
 
  // ── Traversal ─────────────────────────────────────────────────────────────
  const [traversalType, setTraversalType] = useState<TraversalType>("inorder");
  const [traversalResult, setTraversalResult] = useState<TraversalOutput | null>(null);
  const [traversalStep, setTraversalStep] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [playSpeed, setPlaySpeed]   = useState(600);
 
  // ── Rebuild ───────────────────────────────────────────────────────────────
  const [rebuildMode, setRebuildMode] = useState<RebuildMode>("inorder+preorder");
  const [rebuildInorder, setRebuildInorder] = useState<string>("");
  const [rebuildSecond, setRebuildSecond]   = useState<string>("");
  const [rebuildResult, setRebuildResult]   = useState<RebuildOutput | null>(null);
 
  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast]           = useState<string | null>(null);
 
  // Keep ref in sync so callbacks always read latest values
  useEffect(() => { valuesRef.current = values; }, [values]);
 
  const showToast = (msg: string, ms = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };
 
  // ─── Helpers to get typed results ─────────────────────────────────────────
  const currentTree: BSTBuildResult | null =
    buildResult && !buildResult.error ? (buildResult as BSTBuildResult) : null;
 
  const currentRebuild: RebuildResult | null =
    rebuildResult && !rebuildResult.error ? (rebuildResult as RebuildResult) : null;
 
  /** The root that should be visualized (build or rebuild, whichever is active) */
  const activeRoot: BSTNode | null = currentTree?.root ?? currentRebuild?.root ?? null;
 
  const currentTraversal: TraversalResult | null =
    traversalResult && !traversalResult.error
      ? (traversalResult as TraversalResult)
      : null;
 
  // ─── Build actions ─────────────────────────────────────────────────────────
  const addValue = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") return;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num)) {
      showToast("⚠ Solo se permiten números válidos.");
      return;
    }
    if (valuesRef.current.length >= 30) {
      showToast("⚠ Máximo 30 elementos.");
      return;
    }
    setValues(prev => { const next = [...prev, num]; valuesRef.current = next; return next; });
    setInputText("");
    setBuildResult(null);
    setTraversalResult(null);
    setTraversalStep(0);
  }, []);
 
  // ─── Load values atomically (used by Random generator) ────────────────────
  const loadValues = useCallback((nums: number[]) => {
    const clean = nums.filter(n => isFinite(n)).slice(0, 30);
    valuesRef.current = clean;
    setValues(clean);
    setInputText("");
    setBuildResult(null);
    setTraversalResult(null);
    setTraversalStep(0);
    setIsPlaying(false);
    setRebuildResult(null);
  }, []);
 
  const removeValue = useCallback((idx: number) => {
    setValues(prev => prev.filter((_, i) => i !== idx));
    setBuildResult(null);
    setTraversalResult(null);
    setTraversalStep(0);
  }, []);
 
  const clear = useCallback(() => {
    setValues([]);
    setInputText("");
    setBuildResult(null);
    setTraversalResult(null);
    setTraversalStep(0);
    setIsPlaying(false);
    setRebuildResult(null);
    setRebuildInorder("");
    setRebuildSecond("");
  }, []);
 
  const build = useCallback(() => {
    const current = valuesRef.current;
    if (current.length === 0) {
      showToast("⚠ Agrega al menos un número.");
      return;
    }
    const output = computeBSTBuild(current);
    if (output.error) {
      const msgs: Record<string, string> = {
        empty:          "⚠ El arreglo está vacío.",
        too_large:      "⚠ Máximo 30 nodos permitidos.",
        invalid_values: "⚠ Valores inválidos en el arreglo.",
      };
      showToast(msgs[output.reason] ?? "⚠ Error desconocido.");
      return;
    }
    setBuildResult(output);
    setTraversalResult(null);
    setTraversalStep(0);
    setIsPlaying(false);
    setRebuildResult(null);
  }, []);
 
  // ─── Traversal actions ─────────────────────────────────────────────────────
  const runTraversal = useCallback(() => {
    const root = activeRoot;
    if (!root) {
      showToast("⚠ Construye un árbol primero.");
      return;
    }
    const output = computeTraversal(root, traversalType);
    if (output.error) {
      showToast("⚠ Error al calcular el recorrido.");
      return;
    }
    setTraversalResult(output);
    setTraversalStep(0);
    setIsPlaying(false);
  }, [activeRoot, traversalType]);
 
  const nextStep = useCallback(() => {
    if (!currentTraversal) return;
    setTraversalStep(s => Math.min(s + 1, currentTraversal.steps.length - 1));
  }, [currentTraversal]);
 
  const prevStep = useCallback(() => {
    setTraversalStep(s => Math.max(s - 1, 0));
  }, []);
 
  const goToStep = useCallback((n: number) => {
    if (!currentTraversal) return;
    setTraversalStep(Math.max(0, Math.min(n, currentTraversal.steps.length - 1)));
  }, [currentTraversal]);
 
  const play = useCallback(() => {
    if (!currentTraversal) return;
    if (traversalStep >= currentTraversal.steps.length - 1) {
      setTraversalStep(0);
    }
    setIsPlaying(true);
  }, [currentTraversal, traversalStep]);
 
  const pause = useCallback(() => setIsPlaying(false), []);
 
  // ─── Rebuild actions ───────────────────────────────────────────────────────
  const doRebuild = useCallback(() => {
    const parseSeq = (s: string) =>
      s.trim().split(/[\s,]+/).filter(Boolean).map(Number);
 
    const inSeq  = parseSeq(rebuildInorder);
    const secSeq = parseSeq(rebuildSecond);
 
    const output = computeRebuild(inSeq, secSeq, rebuildMode);
 
    if (output.error) {
      const msgs: Record<string, string> = {
        empty:           "⚠ Ambas secuencias son requeridas.",
        too_large:       "⚠ Máximo 30 nodos permitidos.",
        invalid_values:  "⚠ Las secuencias contienen valores inválidos.",
        duplicate_values:"⚠ Las secuencias contienen valores duplicados.",
        length_mismatch: "⚠ Ambas secuencias deben tener la misma cantidad de elementos.",
        value_mismatch:  "⚠ Ambas secuencias deben contener los mismos valores.",
        invalid_sequence:"⚠ Las secuencias son inconsistentes para un BST válido.",
        rebuild_failed:  `⚠ ${(output as any).message ?? "No se pudo reconstruir el árbol."}`,
      };
      showToast(msgs[output.reason] ?? "⚠ Error al reconstruir.");
      return;
    }
 
    setRebuildResult(output);
    setBuildResult(null);
    setTraversalResult(null);
    setTraversalStep(0);
    setIsPlaying(false);
  }, [rebuildInorder, rebuildSecond, rebuildMode]);
 
  /** Pre-fill rebuild inputs from the current build result */
  const prefillRebuildFromCurrent = useCallback(() => {
    const tree = currentTree ?? currentRebuild;
    if (!tree) {
      showToast("⚠ Construye un árbol primero.");
      return;
    }
    setRebuildInorder(tree.inorder.join(" "));
    setRebuildSecond(
      rebuildMode === "inorder+preorder"
        ? tree.preorder.join(" ")
        : tree.postorder.join(" ")
    );
  }, [currentTree, currentRebuild, rebuildMode]);
 
  const clearRebuild = useCallback(() => {
    setRebuildInorder("");
    setRebuildSecond("");
    setRebuildResult(null);
  }, []);
 
  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    // ─ State
    values,
    inputText,
    buildResult,
    activeTab,
    traversalType,
    traversalResult,
    traversalStep,
    isPlaying,
    playSpeed,
    rebuildMode,
    rebuildInorder,
    rebuildSecond,
    rebuildResult,
    toast,
 
    // ─ Derived
    currentTree,
    currentRebuild,
    currentTraversal,
    activeRoot,
    totalValues: values.length,
 
    // ─ Setters
    setInputText,
    setActiveTab,
    setTraversalType,
    setPlaySpeed,
    setRebuildMode,
    setRebuildInorder,
    setRebuildSecond,
 
    // ─ Actions
    addValue,
    loadValues,
    removeValue,
    clear,
    build,
    runTraversal,
    nextStep,
    prevStep,
    goToStep,
    play,
    pause,
    doRebuild,
    prefillRebuildFromCurrent,
    clearRebuild,
  };
}