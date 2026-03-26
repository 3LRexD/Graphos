/**
 * Algorithm Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Para agregar un nuevo algoritmo:
 *  1. Crea  algorithms/miAlgo.ts
 *  2. Agrega una entrada en ALGO_REGISTRY abajo
 *  3. Crea  components/panels/MiAlgoTable.tsx
 *  4. Agrega el case en SidePanel.tsx
 *  Nada más.
 */

export interface AlgoDefinition {
  id:                  string;
  label:               string;
  icon:                string;
  color:               string;
  colorDim:            string;
  description:         string[];
  requiresOriginDest:  boolean;
}

export const ALGO_REGISTRY: AlgoDefinition[] = [
  {
    id:                 "cpm",
    label:              "CPM / PERT",
    icon:               "◆",
    color:              "#ff0055",
    colorDim:           "rgba(255,0,85,0.18)",
    description:        ["Método de Ruta Crítica", "Maximiza duración total", "Resalta el camino más largo"],
    requiresOriginDest: false,
  },
  {
    id:                 "johnson",
    label:              "Johnson",
    icon:               "◇",
    color:              "#00e5ff",
    colorDim:           "rgba(0,229,255,0.15)",
    description:        ["Ruta mínima (Dijkstra)", "Minimiza costo/tiempo", "Origen → Destino"],
    requiresOriginDest: true,
  },
  {
    id:                 "hungarian-min",
    label:              "Asignación MIN",
    icon:               "⬇",
    color:              "#00e5ff",
    colorDim:           "rgba(0,229,255,0.15)",
    description:        ["Método Húngaro", "Minimiza costo total", "Agente → Tarea"],
    requiresOriginDest: false,
  },
  {
    id:                 "hungarian-max",
    label:              "Asignación MAX",
    icon:               "⬆",
    color:              "#00ff88",
    colorDim:           "rgba(0,255,136,0.15)",
    description:        ["Método Húngaro", "Maximiza ganancia total", "Agente → Tarea"],
    requiresOriginDest: false,
  },

  // ── Futuros ──────────────────────────────────────────────────────────────
  // { id: "bellman", label: "Bellman-Ford", icon: "⬡", color: "#f59e0b", colorDim: "rgba(245,158,11,0.18)", description: ["Pesos negativos", "Detecta ciclos negativos", "SSSP general"], requiresOriginDest: true },
  // { id: "floyd",   label: "Floyd-Warshall", icon: "⊞", color: "#a855f7", colorDim: "rgba(168,85,247,0.18)", description: ["Todos los pares", "Matriz de distancias", "O(n³)"], requiresOriginDest: false },
  // { id: "kruskal", label: "Kruskal / MST",  icon: "⌥", color: "#00ff88", colorDim: "rgba(0,255,136,0.15)", description: ["Árbol expansión mínima", "Greedy por peso", "No dirigidos"],  requiresOriginDest: false },
];

export function getAlgo(id: string): AlgoDefinition | undefined {
  return ALGO_REGISTRY.find((a) => a.id === id);
}