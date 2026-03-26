import type { GNode, GEdge } from "@/types";

// ─── Result types ─────────────────────────────────────────────────────────────

export interface HungarianResult {
  error: false;
  mode: "min" | "max";
  assignments: { agentId: number; taskId: number; agentLabel: string; taskLabel: string; cost: number }[];
  totalCost: number;
  matrix: number[][];
  agentNodes: GNode[];
  taskNodes: GNode[];
  steps: HungarianStep[];
}

export interface HungarianError {
  error: "not_bipartite" | "empty" | "no_edges";
}

export type HungarianOutput = HungarianResult | HungarianError | null;

export interface HungarianStep {
  description: string;
  matrix: number[][];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detects two disjoint sets from the graph edges (bipartite partition).
 * Agents = nodes that only appear as edge sources (or majority source).
 * Tasks  = nodes that only appear as edge targets (or majority target).
 *
 * For the assignment problem the user should draw edges FROM agents TO tasks.
 */
function partitionBipartite(
  nodes: GNode[],
  edges: GEdge[]
): { agents: GNode[]; tasks: GNode[] } | null {
  const outSet = new Set<number>();
  const inSet  = new Set<number>();
  edges.forEach((e) => {
    outSet.add(e.from.id);
    inSet.add(e.to.id);
  });

  // Pure sources = agents, pure sinks = tasks
  const agentIds = [...outSet].filter((id) => !inSet.has(id));
  const taskIds  = [...inSet].filter((id)  => !outSet.has(id));

  // Fall back: nodes with more outgoing than incoming are agents
  if (agentIds.length === 0 || taskIds.length === 0) {
    const outDeg = new Map<number, number>();
    const inDeg  = new Map<number, number>();
    nodes.forEach((n) => { outDeg.set(n.id, 0); inDeg.set(n.id, 0); });
    edges.forEach((e) => {
      outDeg.set(e.from.id, (outDeg.get(e.from.id) || 0) + 1);
      inDeg.set(e.to.id,   (inDeg.get(e.to.id)    || 0) + 1);
    });
    const sorted = [...nodes].sort((a, b) =>
      (outDeg.get(b.id)! - inDeg.get(b.id)!) - (outDeg.get(a.id)! - inDeg.get(a.id)!)
    );
    const half    = Math.floor(sorted.length / 2);
    const agents  = sorted.slice(0, half);
    const tasks   = sorted.slice(half);
    return agents.length && tasks.length ? { agents, tasks } : null;
  }

  const agents = nodes.filter((n) => agentIds.includes(n.id));
  const tasks  = nodes.filter((n) => taskIds.includes(n.id));
  return { agents, tasks };
}

/** Pad a rectangular matrix to make it square (fill with `fill` value). */
function padSquare(matrix: number[][], fill: number): number[][] {
  const n = Math.max(matrix.length, matrix[0]?.length ?? 0);
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => matrix[i]?.[j] ?? fill)
  );
}

/** Deep clone a 2-D number array. */
const clone2D = (m: number[][]): number[][] => m.map((r) => [...r]);

// ─── Core Hungarian (Munkres) ─────────────────────────────────────────────────

/**
 * Solves the square assignment problem via the Hungarian / Munkres algorithm.
 * Always minimises — for maximisation pass the negated matrix.
 * Returns the assignment as an array of [row, col] pairs.
 */
function hungarianSolve(costMatrix: number[][]): [number, number][] {
  const n   = costMatrix.length;
  const INF = Infinity;
  const mat = clone2D(costMatrix);

  // Step 1 — subtract row minima
  for (let r = 0; r < n; r++) {
    const min = Math.min(...mat[r]);
    mat[r] = mat[r].map((v) => v - min);
  }

  // Step 2 — subtract column minima
  for (let c = 0; c < n; c++) {
    const min = Math.min(...mat.map((r) => r[c]));
    mat.forEach((r) => (r[c] -= min));
  }

  const rowCover = new Array<boolean>(n).fill(false);
  const colCover = new Array<boolean>(n).fill(false);
  // starred[r][c] = true means zero is starred
  const starred  = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const primed   = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));

  // Step 3 — star zeros
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (mat[r][c] === 0 && !rowCover[r] && !colCover[c]) {
        starred[r][c] = true;
        rowCover[r]   = true;
        colCover[c]   = true;
      }
    }
  }
  rowCover.fill(false);
  colCover.fill(false);

  const coverStarredCols = () => {
    colCover.fill(false);
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (starred[r][c]) colCover[c] = true;
  };

  const countCoveredCols = () => colCover.filter(Boolean).length;

  coverStarredCols();

  // Main loop (steps 4-6)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (countCoveredCols() >= n) break; // done

    // Step 4: find uncovered zero, prime it
    let step4Again = true;
    while (step4Again) {
      step4Again = false;
      let foundR = -1, foundC = -1;
      outer: for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (mat[r][c] === 0 && !rowCover[r] && !colCover[c]) {
            foundR = r; foundC = c; break outer;
          }
        }
      }

      if (foundR === -1) {
        // Step 6: no uncovered zero — adjust matrix
        let minVal = INF;
        for (let r = 0; r < n; r++)
          for (let c = 0; c < n; c++)
            if (!rowCover[r] && !colCover[c]) minVal = Math.min(minVal, mat[r][c]);
        for (let r = 0; r < n; r++)
          for (let c = 0; c < n; c++) {
            if (rowCover[r])  mat[r][c] += minVal;
            if (!colCover[c]) mat[r][c] -= minVal;
          }
        // Restart step 4
        step4Again = true;
        continue;
      }

      primed[foundR][foundC] = true;

      // Is there a starred zero in this row?
      const starC = starred[foundR].indexOf(true);
      if (starC !== -1) {
        rowCover[foundR] = true;
        colCover[starC]  = false;
      } else {
        // Step 5: augmenting path
        let path: [number, number][] = [[foundR, foundC]];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const [pr, pc] = path[path.length - 1];
          // Find starred zero in column pc
          let sr = -1;
          for (let r = 0; r < n; r++) if (starred[r][pc]) { sr = r; break; }
          if (sr === -1) break;
          path.push([sr, pc]);
          // Find primed zero in row sr
          const primedC = primed[sr].indexOf(true);
          path.push([sr, primedC]);
        }
        // Augment
        path.forEach(([r, c]) => {
          starred[r][c] = !starred[r][c];
        });
        // Clear covers and primes
        rowCover.fill(false);
        colCover.fill(false);
        primed.forEach((r) => r.fill(false));
        coverStarredCols();
        step4Again = false; // restart outer while
      }
    }
  }

  // Extract assignment from starred zeros
  const result: [number, number][] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (starred[r][c]) result.push([r, c]);
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the Hungarian algorithm on the current graph.
 *
 * Convention: draw edges FROM agent nodes TO task nodes.
 * Edge weights = cost (minimise) or profit (maximise).
 */
export function computeHungarian(
  nodes: GNode[],
  edges: GEdge[],
  mode: "min" | "max"
): HungarianOutput {
  if (!nodes.length) return { error: "empty" };
  if (!edges.length) return { error: "no_edges" };

  const partition = partitionBipartite(nodes, edges);
  if (!partition) return { error: "not_bipartite" };

  const { agents, tasks } = partition;
  const nA = agents.length;
  const nT = tasks.length;

  // Build cost matrix (agents × tasks), missing edges → large penalty
  const BIG  = 1e9;
  const rawMatrix: number[][] = Array.from({ length: nA }, () =>
    new Array<number>(nT).fill(BIG)
  );

  edges.forEach((e) => {
    const aIdx = agents.findIndex((n) => n.id === e.from.id);
    const tIdx = tasks.findIndex((n)  => n.id === e.to.id);
    if (aIdx !== -1 && tIdx !== -1)
      rawMatrix[aIdx][tIdx] = parseFloat(e.weight) || 0;
  });

  const steps: HungarianStep[] = [];
  steps.push({ description: "Matriz original de costos", matrix: clone2D(rawMatrix) });

  // For maximisation: negate so we can always minimise
  const workMatrix = mode === "max"
    ? rawMatrix.map((row) => row.map((v) => v === BIG ? BIG : -v))
    : clone2D(rawMatrix);

  if (mode === "max") {
    steps.push({ description: "Matriz negada (para convertir max → min)", matrix: clone2D(workMatrix) });
  }

  // Pad to square
  const fillVal  = mode === "max" ? BIG : BIG;
  const squared  = padSquare(workMatrix, fillVal);
  const n        = squared.length;

  // Row reduction step (for display)
  const afterRowRed = clone2D(squared);
  for (let r = 0; r < n; r++) {
    const min = Math.min(...afterRowRed[r].filter((v) => v < BIG / 2));
    if (isFinite(min)) afterRowRed[r] = afterRowRed[r].map((v) => v < BIG / 2 ? v - min : v);
  }
  steps.push({ description: "Después de reducción por filas", matrix: afterRowRed.slice(0, nA).map((r) => r.slice(0, nT)) });

  // Col reduction step (for display)
  const afterColRed = clone2D(afterRowRed);
  for (let c = 0; c < n; c++) {
    const col = afterColRed.map((r) => r[c]).filter((v) => v < BIG / 2);
    const min = col.length ? Math.min(...col) : 0;
    if (isFinite(min)) afterColRed.forEach((r) => { if (r[c] < BIG / 2) r[c] -= min; });
  }
  steps.push({ description: "Después de reducción por columnas", matrix: afterColRed.slice(0, nA).map((r) => r.slice(0, nT)) });

  // Solve
  const pairs = hungarianSolve(squared);

  // Build assignments (only valid agent→task pairs, ignore padding)
  const assignments: HungarianResult["assignments"] = [];
  let totalCost = 0;

  pairs.forEach(([r, c]) => {
    if (r >= nA || c >= nT) return; // padding row/col
    const agent = agents[r];
    const task  = tasks[c];
    const cost  = rawMatrix[r][c] === BIG ? 0 : rawMatrix[r][c];
    assignments.push({
      agentId:    agent.id,
      taskId:     task.id,
      agentLabel: agent.label,
      taskLabel:  task.label,
      cost,
    });
    totalCost += cost;
  });

  return {
    error:       false,
    mode,
    assignments,
    totalCost,
    matrix:      rawMatrix,
    agentNodes:  agents,
    taskNodes:   tasks,
    steps,
  };
}