/**
 * Algorithm Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Central place to register every algorithm the editor supports.
 *
 * TO ADD A NEW ALGORITHM:
 *  1. Create  algorithms/myAlgo.ts  with your compute function
 *  2. Add one entry to ALGO_REGISTRY below
 *  3. Create  components/panels/MyAlgoTable.tsx  if it needs a results panel
 *
 * Nothing else in the codebase needs to change.
 */

export interface AlgoDefinition {
  /** Unique key — used as AlgoMode value */
  id: string;
  /** Display label in the selector modal */
  label: string;
  /** Icon symbol shown in toolbar button */
  icon: string;
  /** Brand color (hex) for highlights, borders, etc. */
  color: string;
  /** Dimmed version of color for backgrounds (rgba) */
  colorDim: string;
  /** Short description lines shown in the selector modal */
  description: string[];
  /**
   * Whether this algorithm needs the user to pick an origin/destination node
   * before it can run (e.g. Johnson). CPM-style algorithms set this to false.
   */
  requiresOriginDest: boolean;
}

export const ALGO_REGISTRY: AlgoDefinition[] = [
  {
    id: "cpm",
    label: "CPM / PERT",
    icon: "◆",
    color: "#ff0055",
    colorDim: "rgba(255,0,85,0.18)",
    description: [
      "Método de Ruta Crítica",
      "Maximiza duración total",
      "Resalta el camino más largo",
    ],
    requiresOriginDest: false,
  },
  {
    id: "johnson",
    label: "Johnson",
    icon: "◇",
    color: "#00e5ff",
    colorDim: "rgba(0,229,255,0.15)",
    description: [
      "Ruta mínima (Dijkstra)",
      "Minimiza costo/tiempo",
      "Origen → Destino",
    ],
    requiresOriginDest: true,
  },

  // ── Future algorithms — add entries here ──────────────────────────────────
  // {
  //   id: "bellman",
  //   label: "Bellman-Ford",
  //   icon: "⬡",
  //   color: "#f59e0b",
  //   colorDim: "rgba(245,158,11,0.18)",
  //   description: ["Maneja pesos negativos", "Detecta ciclos negativos", "SSSP general"],
  //   requiresOriginDest: true,
  // },
  // {
  //   id: "floyd",
  //   label: "Floyd-Warshall",
  //   icon: "⊞",
  //   color: "#a855f7",
  //   colorDim: "rgba(168,85,247,0.18)",
  //   description: ["Todos los pares", "Matriz de distancias", "O(n³)"],
  //   requiresOriginDest: false,
  // },
  // {
  //   id: "kruskal",
  //   label: "Kruskal / MST",
  //   icon: "⌥",
  //   color: "#00ff88",
  //   colorDim: "rgba(0,255,136,0.15)",
  //   description: ["Árbol de expansión mínima", "Greedy por peso", "Grafos no dirigidos"],
  //   requiresOriginDest: false,
  // },
];

/** Lookup helper */
export function getAlgo(id: string): AlgoDefinition | undefined {
  return ALGO_REGISTRY.find((a) => a.id === id);
}