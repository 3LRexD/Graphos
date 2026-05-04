import type { GEdge } from "./graph";

export type ToolMode = "add" | "connect" | "move" | "edit" | "delete";

export type AlgoMode =
  | "none"
  | "cpm"
  | "johnson-min"
  | "johnson-max"
  | "hungarian-min"
  | "hungarian-max"
  | "kruskal";

export interface PromptCfg {
  open:        boolean;
  title:       string;
  value:       string;
  placeholder: string;
  error:       string;
  onOk:        ((v: string) => void) | null;
  onCancel:    (() => void) | null;
}

// ── CPM ────────────────────────────────────────────────────────────────────
export interface CPMResult {
  error:     false;
  TE:        Record<number, number>;
  TL:        Record<number, number>;
  maxTE:     number;
  critEdges: Set<GEdge>;
  topo:      number[];
}
export interface CPMError { error: true; }
export type CPMOutput = CPMResult | CPMError | null;

// ── Johnson ────────────────────────────────────────────────────────────────
export interface JohnsonResult {
  error:     false;
  dist:      Record<number, number>;
  pathEdges: GEdge[];
  pathNodes: number[];
  totalCost: number;
}
export interface JohnsonError { error: "no_path"; }
export type JohnsonOutput = JohnsonResult | JohnsonError | null;

// ── Kruskal ────────────────────────────────────────────────────────────────
export interface KruskalResult {
  error:       false;
  mstEdges:    GEdge[];
  totalWeight: number;
}
export interface KruskalError {
  error: "insufficient_nodes" | "disconnected_graph";
  mstEdges: GEdge[];
  totalWeight: number;
}
export type KruskalOutput = KruskalResult | KruskalError | null;