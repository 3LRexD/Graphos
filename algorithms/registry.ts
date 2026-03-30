/**
 * Algorithm Registry — hierarchical two-step selection model.
 *
 * Level 1: "families" shown in the main selector modal.
 * Level 2: "variants" shown in the sub-picker when a family is clicked.
 *
 * TO ADD A NEW ALGORITHM:
 *   1. Add a family entry (or a variant to an existing family)
 *   2. Create algorithms/myAlgo.ts
 *   3. Create components/panels/MyAlgoPanel.tsx
 *   4. Handle the new AlgoMode in GraphEditor solve()
 */

export interface AlgoVariant {
  id:          string;       // maps to AlgoMode value
  label:       string;
  description: string;
  icon:        string;
  color:       string;
  colorDim:    string;
}

export interface AlgoFamily {
  id:          string;
  label:       string;
  icon:        string;
  color:       string;
  colorDim:    string;
  description: string;       // shown under the family card
  coming?:     boolean;      // true = "próximamente" — not selectable
  variants?:   AlgoVariant[]; // if present → shows sub-picker
  directMode?: string;       // if present (no variants) → selects this AlgoMode directly
}

export const ALGO_FAMILIES: AlgoFamily[] = [
  {
    id:          "pizarra",
    label:       "Pizarra de Grafos",
    icon:        "⬡",
    color:       "#A855F7",
    colorDim:    "rgba(168,85,247,0.18)",
    description: "Modo libre sin restricciones. Permite auto-conexiones y aristas bidireccionales.",
    directMode:  "none",
  },
  {
    id:          "johnson",
    label:       "Johnson",
    icon:        "◇",
    color:       "#00e5ff",
    colorDim:    "rgba(0,229,255,0.15)",
    description: "Ruta óptima entre dos nodos. Selecciona origen y destino en el grafo.",
    variants: [
      {
        id:          "johnson-min",
        label:       "Minimizar",
        description: "Encuentra el camino de menor costo entre origen y destino (Dijkstra).",
        icon:        "⬇",
        color:       "#00e5ff",
        colorDim:    "rgba(0,229,255,0.15)",
      },
      {
        id:          "johnson-max",
        label:       "Maximizar / CPM",
        description: "Ruta de mayor duración — equivalente al Método de Ruta Crítica (CPM/PERT).",
        icon:        "⬆",
        color:       "#ff0055",
        colorDim:    "rgba(255,0,85,0.18)",
      },
    ],
  },
  {
    id:          "asignacion",
    label:       "Asignación",
    icon:        "⊞",
    color:       "#00ff88",
    colorDim:    "rgba(0,255,136,0.15)",
    description: "Método Húngaro. Asigna agentes a tareas de forma óptima.",
    variants: [
      {
        id:          "hungarian-min",
        label:       "Minimizar Costo",
        description: "Asignación que minimiza el costo total (ej. horas, distancia, precio).",
        icon:        "⬇",
        color:       "#00e5ff",
        colorDim:    "rgba(0,229,255,0.15)",
      },
      {
        id:          "hungarian-max",
        label:       "Maximizar Ganancia",
        description: "Asignación que maximiza la ganancia o eficiencia total.",
        icon:        "⬆",
        color:       "#00ff88",
        colorDim:    "rgba(0,255,136,0.15)",
      },
    ],
  },
  {
    id:      "northwest",
    label:   "North West",
    icon:    "↖",
    color:   "#666",
    colorDim:"rgba(100,100,100,0.15)",
    description: "Método de la esquina noroeste para transporte.",
    coming:  true,
  },
  {
    id:      "sorts",
    label:   "Sorts",
    icon:    "⇅",
    color:   "#666",
    colorDim:"rgba(100,100,100,0.15)",
    description: "Algoritmos de ordenamiento visualizados sobre grafos.",
    coming:  true,
  },
  {
    id:      "bintree",
    label:   "Árboles Binarios",
    icon:    "⌥",
    color:   "#666",
    colorDim:"rgba(100,100,100,0.15)",
    description: "Construcción y recorrido de árboles binarios.",
    coming:  true,
  },
  {
    id:      "dijkstra",
    label:   "Dijkstra",
    icon:    "◉",
    color:   "#666",
    colorDim:"rgba(100,100,100,0.15)",
    description: "Camino más corto desde un origen a todos los nodos.",
    coming:  true,
  },
  {
    id:      "kruskal",
    label:   "Kruskal",
    icon:    "✳",
    color:   "#666",
    colorDim:"rgba(100,100,100,0.15)",
    description: "Árbol de expansión mínima por selección greedy de aristas.",
    coming:  true,
  },
];

export function getFamily(id: string): AlgoFamily | undefined {
  return ALGO_FAMILIES.find((f) => f.id === id);
}

export function getVariant(algoMode: string): AlgoVariant | undefined {
  for (const f of ALGO_FAMILIES) {
    const v = f.variants?.find((v) => v.id === algoMode);
    if (v) return v;
  }
  return undefined;
}

/** Returns the accent color for any active AlgoMode */
export function getAlgoColor(algoMode: string): string {
  const variant = getVariant(algoMode);
  if (variant) return variant.color;
  const family = ALGO_FAMILIES.find((f) => f.directMode === algoMode);
  if (family) return family.color;
  return "#A855F7";
}