// ─── Core graph primitives ────────────────────────────────────────────────────

export interface GNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

export interface GEdge {
  from: GNode;
  to: GNode;
  weight: string;
}

export interface GraphState {
  nodes: GNode[];
  edges: GEdge[];
  nodeIdCounter: number;
  selectedNode: GNode | null;
  isDragging: boolean;
  tempStartNode: GNode | null;
  mouseX: number;
  mouseY: number;
}