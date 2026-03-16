// ─── UI Modes ─────────────────────────────────────────────────────────────────

export type ToolMode = "add" | "connect" | "move" | "edit" | "delete";

export type AlgoMode = "none" | "cpm" | "johnson";

// ─── Modal prompt config ──────────────────────────────────────────────────────

export interface PromptCfg {
  open: boolean;
  title: string;
  value: string;
  placeholder: string;
  error: string;
  onOk: ((v: string) => void) | null;
  onCancel: (() => void) | null;
}

// ─── Algorithm result shapes ──────────────────────────────────────────────────

export interface CPMResult {
  error: false;
  TE: Record<number, number>;
  TL: Record<number, number>;
  maxTE: number;
  critEdges: Set<import("./graph").GEdge>;
  topo: number[];
}

export interface CPMError {
  error: true;
}

export type CPMOutput = CPMResult | CPMError | null;

export interface JohnsonResult {
  error: false;
  dist: Record<number, number>;
  pathEdges: import("./graph").GEdge[];
  pathNodes: number[];
  totalCost: number;
}

export interface JohnsonError {
  error: "no_path";
}

export type JohnsonOutput = JohnsonResult | JohnsonError | null;