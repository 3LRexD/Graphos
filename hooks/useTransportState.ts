"use client";

import { useState, useCallback } from "react";
import {
  computeNorthWest,
  buildTransportInput,
  exampleInput,
  type TransportOutput,
  type TransportResult,
} from "../algorithms/northWest";

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 4;

function makeLabel(prefix: string, n: number) {
  return Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`);
}
function makeMatrix(r: number, c: number): number[][] {
  return Array.from({ length: r }, () => Array(c).fill(0));
}

export function useTransportState() {
  const [costs, setCosts]         = useState<number[][]>(() => makeMatrix(DEFAULT_ROWS, DEFAULT_COLS));
  const [supply, setSupply]       = useState<number[]>(() => Array(DEFAULT_ROWS).fill(0));
  const [demand, setDemand]       = useState<number[]>(() => Array(DEFAULT_COLS).fill(0));
  const [rowLabels, setRowLabels] = useState<string[]>(() => makeLabel("Origen",  DEFAULT_ROWS));
  const [colLabels, setColLabels] = useState<string[]>(() => makeLabel("Destino", DEFAULT_COLS));
  const [objective, setObjective] = useState<"minimize" | "maximize">("minimize");
  const [result, setResult]       = useState<TransportOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast]         = useState<string | null>(null);

  const showToast = (msg: string, ms = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  // --- Edicion de celdas ---
  const setCostCell = useCallback((row: number, col: number, val: number) => {
    setCosts(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = isNaN(val) ? 0 : val;
      return next;
    });
  }, []);

  const setSupplyCell = useCallback((row: number, val: number) => {
    setSupply(prev => { const next = [...prev]; next[row] = isNaN(val) ? 0 : val; return next; });
  }, []);

  const setDemandCell = useCallback((col: number, val: number) => {
    setDemand(prev => { const next = [...prev]; next[col] = isNaN(val) ? 0 : val; return next; });
  }, []);

  // --- Edicion de etiquetas ---
  const setRowLabel = useCallback((i: number, val: string) => {
    setRowLabels(prev => { const n = [...prev]; n[i] = val; return n; });
  }, []);

  const setColLabel = useCallback((j: number, val: string) => {
    setColLabels(prev => { const n = [...prev]; n[j] = val; return n; });
  }, []);

  // --- Filas ---
  const addRow = useCallback(() => {
    const cols = costs[0]?.length ?? DEFAULT_COLS;
    setCosts(prev => [...prev, Array(cols).fill(0)]);
    setSupply(prev => [...prev, 0]);
    setRowLabels(prev => [...prev, `Origen ${prev.length + 1}`]);
  }, [costs]);

  const removeRow = useCallback(() => {
    if (costs.length <= 1) { showToast("Minimo 1 fila."); return; }
    setCosts(prev => prev.slice(0, -1));
    setSupply(prev => prev.slice(0, -1));
    setRowLabels(prev => prev.slice(0, -1));
  }, [costs.length]);

  // --- Columnas ---
  const addCol = useCallback(() => {
    setCosts(prev => prev.map(row => [...row, 0]));
    setDemand(prev => [...prev, 0]);
    setColLabels(prev => [...prev, `Destino ${prev.length + 1}`]);
  }, []);

  const removeCol = useCallback(() => {
    if ((costs[0]?.length ?? 0) <= 1) { showToast("Minimo 1 columna."); return; }
    setCosts(prev => prev.map(row => row.slice(0, -1)));
    setDemand(prev => prev.slice(0, -1));
    setColLabels(prev => prev.slice(0, -1));
  }, [costs]);

  // --- Resolver ---
  const solve = useCallback(() => {
    const totalSupply = supply.reduce((a, b) => a + b, 0);
    const totalDemand = demand.reduce((a, b) => a + b, 0);
    if (totalSupply === 0 || totalDemand === 0) {
      showToast("Ingresa valores de oferta y demanda mayores a 0.");
      return;
    }
    const input  = buildTransportInput(costs, supply, demand, rowLabels, colLabels, objective);
    const output = computeNorthWest(input);
    if (output.error) {
      const msgs: Record<string, string> = {
        empty:           "La tabla esta vacia.",
        invalid_supply:  "La oferta no puede ser negativa.",
        invalid_demand:  "La demanda no puede ser negativa.",
        negative_values: "Los costos no pueden ser negativos.",
      };
      showToast(msgs[output.reason] ?? "Error desconocido.");
      return;
    }
    setResult(output);
    setCurrentStep(0);
  }, [costs, supply, demand, rowLabels, colLabels, objective]);

  // --- Limpiar ---
  const clear = useCallback(() => {
    const r = costs.length;
    const c = costs[0]?.length ?? DEFAULT_COLS;
    setCosts(makeMatrix(r, c));
    setSupply(Array(r).fill(0));
    setDemand(Array(c).fill(0));
    setResult(null);
    setCurrentStep(0);
  }, [costs]);

  // --- Cargar ejemplo ---
  const loadExample = useCallback((idx = 0) => {
    const ex = exampleInput(idx);
    setCosts(ex.costs);
    setSupply(ex.supply);
    setDemand(ex.demand);
    setRowLabels(ex.rowLabels);
    setColLabels(ex.colLabels);
    setObjective(ex.objective);
    setResult(null);
    setCurrentStep(0);
  }, []);

  // --- Importar JSON ---
  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.costs && data.supply && data.demand) {
          setCosts(data.costs);
          setSupply(data.supply);
          setDemand(data.demand);
          if (data.rowLabels) setRowLabels(data.rowLabels);
          if (data.colLabels) setColLabels(data.colLabels);
          if (data.objective) setObjective(data.objective);
          setResult(null);
        } else {
          showToast("Formato JSON invalido.");
        }
      } catch { showToast("Error al leer el archivo."); }
    };
    reader.readAsText(file);
  }, []);

  // --- Exportar JSON (recibe nombre desde la UI) ---
  const exportJSON = useCallback((fileName: string) => {
    const name = fileName.trim() || "transporte";
    const data = { costs, supply, demand, rowLabels, colLabels, objective };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = name.endsWith(".json") ? name : `${name}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [costs, supply, demand, rowLabels, colLabels, objective]);

  // --- Navegacion de pasos ---
  const nextStep = useCallback(() => {
    if (!result || result.error) return;
    setCurrentStep(s => Math.min(s + 1, (result as TransportResult).steps.length - 1));
  }, [result]);

  const prevStep = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  return {
    costs, supply, demand, rowLabels, colLabels, objective, result,
    currentStep, toast,
    setCostCell, setSupplyCell, setDemandCell,
    setRowLabel, setColLabel, setObjective,
    addRow, removeRow, addCol, removeCol,
    solve, clear, loadExample, importJSON, exportJSON,
    nextStep, prevStep,
    totalSupply: supply.reduce((a, b) => a + b, 0),
    totalDemand: demand.reduce((a, b) => a + b, 0),
  };
}