

export interface TransportInput {
  /** Costos/beneficios: matrix[i][j] = costo de origen i a destino j */
  costs:   number[][];
  /** Oferta disponible en cada origen */
  supply:  number[];
  /** Demanda requerida en cada destino */
  demand:  number[];
  /** Etiquetas de filas */
  rowLabels: string[];
  /** Etiquetas de columnas */
  colLabels: string[];
  /** Si es maximización, se trabaja con beneficios */
  objective: "minimize" | "maximize";
}

export interface TransportStep {
  /** Número de iteración (1-based) */
  iteration: number;
  /** Celda asignada en este paso */
  cell: { row: number; col: number };
  /** Unidades asignadas */
  units: number;
  /** Costo/beneficio unitario de esta celda */
  unitCost: number;
  /** Costo/beneficio total de esta asignación */
  stepCost: number;
  /** Oferta restante por fila después de este paso */
  supplyLeft: number[];
  /** Demanda restante por columna después de este paso */
  demandLeft: number[];
  /** Descripción textual del paso */
  description: string;
  /** Snapshot de la matriz de asignación en este momento */
  matrixSnapshot: number[][];
}

export interface TransportResult {
  error:      false;
  kind:       "northwest";
  objective:  "minimize" | "maximize";
  /** Matriz de asignaciones final: allocation[i][j] = unidades enviadas */
  allocation: number[][];
  /** Costo/beneficio total */
  totalCost:  number;
  /** Pasos detallados del algoritmo */
  steps:      TransportStep[];
  /** Oferta y demanda originales */
  supply:     number[];
  demand:     number[];
  rowLabels:  string[];
  colLabels:  string[];
  /** Costos originales */
  costs:      number[][];
  /** true si oferta == demanda (problema balanceado) */
  isBalanced: boolean;
  /** Método usado */
  method:     string;
}

export type TransportError =
  | { error: true; reason: "empty" }
  | { error: true; reason: "invalid_supply" }
  | { error: true; reason: "invalid_demand" }
  | { error: true; reason: "negative_values" };

export type TransportOutput = TransportResult | TransportError;

// ─── Algoritmo: Esquina Noroeste ──────────────────────────────────────────────

export function computeNorthWest(input: TransportInput): TransportOutput {
  const { costs, supply, demand, rowLabels, colLabels, objective } = input;

  // Validaciones
  if (!supply.length || !demand.length) return { error: true, reason: "empty" };
  if (supply.some(s => s < 0)) return { error: true, reason: "invalid_supply" };
  if (demand.some(d => d < 0)) return { error: true, reason: "invalid_demand" };
  if (costs.some(row => row.some(v => v < 0))) return { error: true, reason: "negative_values" };

  const m = supply.length;
  const n = demand.length;
  const totalSupply = supply.reduce((a, b) => a + b, 0);
  const totalDemand = demand.reduce((a, b) => a + b, 0);
  const isBalanced  = totalSupply === totalDemand;

  // Copias de trabajo
  const s = [...supply];
  const d = [...demand];

  // Matriz de asignaciones inicializada en 0
  const allocation: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

  const steps: TransportStep[] = [];
  let i = 0; // fila actual (origen)
  let j = 0; // columna actual (destino)
  let iter = 1;

  while (i < m && j < n) {
    const units   = Math.min(s[i], d[j]);
    const unitCost = costs[i]?.[j] ?? 0;

    allocation[i][j] = units;
    s[i] -= units;
    d[j] -= units;

    const supplySnap  = [...s];
    const demandSnap  = [...d];
    const matrixSnap  = allocation.map(row => [...row]);

    steps.push({
      iteration:      iter++,
      cell:           { row: i, col: j },
      units,
      unitCost,
      stepCost:       units * unitCost,
      supplyLeft:     supplySnap,
      demandLeft:     demandSnap,
      description:    `Asignar ${units} unidades de ${rowLabels[i]} a ${colLabels[j]} (costo unitario: ${unitCost})`,
      matrixSnapshot: matrixSnap,
    });

    // Avanzar: si la oferta se agotó → siguiente fila
    //          si la demanda se satisfizo → siguiente columna
    if (s[i] === 0 && d[j] === 0) {
      // Degeneración: ambos se agotan al mismo tiempo → avanza fila y columna
      i++; j++;
    } else if (s[i] === 0) {
      i++;
    } else {
      j++;
    }
  }

  const totalCost = steps.reduce((acc, st) => acc + st.stepCost, 0);

  return {
    error:      false,
    kind:       "northwest",
    objective,
    allocation,
    totalCost,
    steps,
    supply,
    demand,
    rowLabels,
    colLabels,
    costs,
    isBalanced,
    method:     "Esquina Noroeste",
  };
}

// ─── Utilidades de construcción de input ─────────────────────────────────────
// Facilitan crear el TransportInput desde la UI sin conocer el algoritmo.

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

/** Devuelve una entrada de ejemplo lista para usar */
export function exampleInput(idx = 0): TransportInput {
  const examples: TransportInput[] = [
    {
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
  ];
  return examples[idx % examples.length];
}