/**
 * northWest.ts — Método de la Esquina Noroeste
 * ──────────────────────────────────────────────────────────────────
 * Función pura. Cero UI.
 *
 * BALANCE AUTOMÁTICO:
 *   Si Σoferta ≠ Σdemanda, se agrega una fila o columna ficticia
 *   con costo 0 para balancear antes de correr el algoritmo.
 *   El resultado indica cuál ficticia se usó para que la UI
 *   la pueda mostrar de forma diferenciada.
 */

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface TransportInput {
  costs:     number[][];
  supply:    number[];
  demand:    number[];
  rowLabels: string[];
  colLabels: string[];
  objective: "minimize" | "maximize";
}

export interface TransportStep {
  iteration:      number;
  cell:           { row: number; col: number };
  units:          number;
  unitCost:       number;
  stepCost:       number;
  supplyLeft:     number[];
  demandLeft:     number[];
  description:    string;
  matrixSnapshot: number[][];
  /** true si esta celda pertenece a la fila/columna ficticia */
  isDummy:        boolean;
}

export interface DummyInfo {
  /** "row" = se agregó origen ficticio | "col" = se agregó destino ficticio */
  type:  "row" | "col";
  /** Índice dentro de la matriz balanceada */
  index: number;
  /** Unidades que absorbe la ficticia */
  units: number;
  /** Etiqueta que se muestra en la UI */
  label: string;
}

export interface TransportResult {
  error:      false;
  kind:       "northwest";
  objective:  "minimize" | "maximize";
  allocation: number[][];
  totalCost:  number;
  steps:      TransportStep[];
  /** Oferta ORIGINAL (sin ficticia) */
  supply:     number[];
  /** Demanda ORIGINAL (sin ficticia) */
  demand:     number[];
  /** Oferta usada en el cálculo (puede incluir ficticia) */
  supplyUsed: number[];
  /** Demanda usada en el cálculo (puede incluir ficticia) */
  demandUsed: number[];
  rowLabels:  string[];
  colLabels:  string[];
  costs:      number[][];
  isBalanced: boolean;
  /** null si ya estaba balanceado, objeto si se agregó ficticia */
  dummy:      DummyInfo | null;
  method:     string;
}

export type TransportError =
  | { error: true; reason: "empty"           }
  | { error: true; reason: "invalid_supply"  }
  | { error: true; reason: "invalid_demand"  }
  | { error: true; reason: "negative_values" };

export type TransportOutput = TransportResult | TransportError;

// ─── Algoritmo principal ──────────────────────────────────────────────────────

export function computeNorthWest(input: TransportInput): TransportOutput {
  const { costs, supply, demand, rowLabels, colLabels, objective } = input;

  // Validaciones básicas
  if (!supply.length || !demand.length) return { error: true, reason: "empty" };
  if (supply.some(s => s < 0))          return { error: true, reason: "invalid_supply" };
  if (demand.some(d => d < 0))          return { error: true, reason: "invalid_demand" };
  if (costs.some(row => row.some(v => v < 0)))
                                         return { error: true, reason: "negative_values" };

  const totalSupply = supply.reduce((a, b) => a + b, 0);
  const totalDemand = demand.reduce((a, b) => a + b, 0);
  const isBalanced  = totalSupply === totalDemand;

  // ── Balancear con fila/columna ficticia si hace falta ──────────────────────
  let workCosts     = costs.map(row => [...row]);
  let workSupply    = [...supply];
  let workDemand    = [...demand];
  let workRowLabels = [...rowLabels];
  let workColLabels = [...colLabels];
  let dummy: DummyInfo | null = null;

  if (totalSupply > totalDemand) {
    // Sobra oferta → agregar columna ficticia (destino ficticio)
    const diff = totalSupply - totalDemand;
    workCosts     = workCosts.map(row => [...row, 0]);
    workDemand    = [...workDemand, diff];
    workColLabels = [...workColLabels, "Destino Ficticio"];
    dummy = { type: "col", index: workColLabels.length - 1, units: diff, label: "Destino Ficticio" };

  } else if (totalDemand > totalSupply) {
    // Sobra demanda → agregar fila ficticia (origen ficticio)
    const diff     = totalDemand - totalSupply;
    const dummyRow = Array(workDemand.length).fill(0);
    workCosts     = [...workCosts, dummyRow];
    workSupply    = [...workSupply, diff];
    workRowLabels = [...workRowLabels, "Origen Ficticio"];
    dummy = { type: "row", index: workRowLabels.length - 1, units: diff, label: "Origen Ficticio" };
  }

  const m = workSupply.length;
  const n = workDemand.length;

  // ── Correr Esquina Noroeste sobre la tabla balanceada ──────────────────────
  const s = [...workSupply];
  const d = [...workDemand];
  const allocation: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  const steps: TransportStep[] = [];
  let i = 0, j = 0, iter = 1;

  while (i < m && j < n) {
    const units    = Math.min(s[i], d[j]);
    const unitCost = workCosts[i]?.[j] ?? 0;
    const isDummy  = (dummy?.type === "row" && i === dummy.index) ||
                     (dummy?.type === "col" && j === dummy.index);

    allocation[i][j] = units;
    s[i] -= units;
    d[j] -= units;

    steps.push({
      iteration:      iter++,
      cell:           { row: i, col: j },
      units,
      unitCost,
      stepCost:       units * unitCost,
      supplyLeft:     [...s],
      demandLeft:     [...d],
      isDummy,
      description:    isDummy
        ? `[FICTICIA] Absorber ${units} unidades en ${workRowLabels[i]} → ${workColLabels[j]} (costo: 0)`
        : `Asignar ${units} unidades de ${workRowLabels[i]} a ${workColLabels[j]} (costo unitario: ${unitCost})`,
      matrixSnapshot: allocation.map(row => [...row]),
    });

    if      (s[i] === 0 && d[j] === 0) { i++; j++; }
    else if (s[i] === 0)               { i++; }
    else                               { j++; }
  }

  // Costo real: excluir celdas ficticias (costo 0, pero queremos dejar claro)
  const totalCost = steps
    .filter(st => !st.isDummy)
    .reduce((acc, st) => acc + st.stepCost, 0);

  return {
    error:      false,
    kind:       "northwest",
    objective,
    allocation,
    totalCost,
    steps,
    supply,
    demand,
    supplyUsed: workSupply,
    demandUsed: workDemand,
    rowLabels:  workRowLabels,
    colLabels:  workColLabels,
    costs:      workCosts,
    isBalanced,
    dummy,
    method:     "Esquina Noroeste",
  };
}

// ─── Helpers de construcción ──────────────────────────────────────────────────

export function buildTransportInput(
  costs:     number[][],
  supply:    number[],
  demand:    number[],
  rowLabels: string[],
  colLabels: string[],
  objective: "minimize" | "maximize" = "minimize"
): TransportInput {
  return { costs, supply, demand, rowLabels, colLabels, objective };
}

export function exampleInput(idx = 0): TransportInput {
  const examples: TransportInput[] = [
    {
      // Balanceado — minimizar
      objective: "minimize",
      rowLabels: ["Origen 1", "Origen 2", "Origen 3"],
      colLabels: ["Destino 1", "Destino 2", "Destino 3", "Destino 4"],
      supply:  [20, 30, 25],
      demand:  [10, 25, 20, 20],
      costs: [
        [2, 3, 1, 5],
        [7, 3, 4, 6],
        [8, 5, 2, 3],
      ],
    },
    {
      // Oferta > Demanda → columna ficticia — maximizar
      objective: "maximize",
      rowLabels: ["Origen 1", "Origen 2", "Origen 3"],
      colLabels: ["Destino 1", "Destino 2", "Destino 3", "Destino 4", "Destino 5"],
      supply:  [2, 5, 5],
      demand:  [2, 2, 1, 1, 2],
      costs: [
        [0, 0, 6, 0, 0],
        [1, 0, 0, 0, 0],
        [2, 4, 6, 4, 0],
      ],
    },
    {
      // Demanda > Oferta → fila ficticia — minimizar
      objective: "minimize",
      rowLabels: ["Fábrica A", "Fábrica B"],
      colLabels: ["Ciudad 1", "Ciudad 2", "Ciudad 3"],
      supply:  [30, 40],
      demand:  [25, 35, 40],
      costs: [
        [2, 3, 1],
        [5, 4, 8],
      ],
    },
  ];
  return examples[idx % examples.length];
}