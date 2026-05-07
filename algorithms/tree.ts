// algorithms/bst.ts
 
export type TraversalType = "inorder" | "preorder" | "postorder";
export type RebuildMode = "inorder+preorder" | "inorder+postorder";
 
// ─── Core Node ────────────────────────────────────────────────────────────────
export interface BSTNode {
  val: number;
  left: BSTNode | null;
  right: BSTNode | null;
}
 
// ─── Traversal Step ───────────────────────────────────────────────────────────
export interface TraversalStep {
  iteration: number;
  visiting: number;       // value of node being visited right now
  visited: number[];      // values already fully visited (in order)
  path: number[];         // full traversal path so far
  description: string;
}
 
export interface TraversalResult {
  error: false;
  traversalType: TraversalType;
  traversalName: string;
  sequence: number[];
  steps: TraversalStep[];
}
 
// ─── Build Result ─────────────────────────────────────────────────────────────
export interface BSTBuildResult {
  error: false;
  root: BSTNode;
  values: number[];        // insertion order
  nodeCount: number;
  height: number;
  inorder: number[];
  preorder: number[];
  postorder: number[];
}
 
// ─── Rebuild Result ───────────────────────────────────────────────────────────
export interface RebuildResult {
  error: false;
  root: BSTNode;
  nodeCount: number;
  height: number;
  inorder: number[];
  preorder: number[];
  postorder: number[];
}
 
// ─── Error Types ──────────────────────────────────────────────────────────────
export type BSTError =
  | { error: true; reason: "empty" }
  | { error: true; reason: "too_large" }
  | { error: true; reason: "invalid_values" }
  | { error: true; reason: "duplicate_values" }
  | { error: true; reason: "length_mismatch" }
  | { error: true; reason: "value_mismatch" }
  | { error: true; reason: "invalid_sequence" }
  | { error: true; reason: "rebuild_failed"; message: string };
 
export type BSTOutput = BSTBuildResult | BSTError;
export type RebuildOutput = RebuildResult | BSTError;
export type TraversalOutput = TraversalResult | BSTError;
 
const TRAVERSAL_NAMES: Record<TraversalType, string> = {
  inorder:   "In-order (Left → Root → Right)",
  preorder:  "Pre-order (Root → Left → Right)",
  postorder: "Post-order (Left → Right → Root)",
};
 
// ─── Internal helpers ─────────────────────────────────────────────────────────
function insertNode(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val)  root.left  = insertNode(root.left,  val);
  else if (val > root.val) root.right = insertNode(root.right, val);
  // duplicate: ignore
  return root;
}
 
function getHeight(node: BSTNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}
 
function getInorder(node: BSTNode | null, result: number[] = []): number[] {
  if (!node) return result;
  getInorder(node.left, result);
  result.push(node.val);
  getInorder(node.right, result);
  return result;
}
 
function getPreorder(node: BSTNode | null, result: number[] = []): number[] {
  if (!node) return result;
  result.push(node.val);
  getPreorder(node.left, result);
  getPreorder(node.right, result);
  return result;
}
 
function getPostorder(node: BSTNode | null, result: number[] = []): number[] {
  if (!node) return result;
  getPostorder(node.left, result);
  getPostorder(node.right, result);
  result.push(node.val);
  return result;
}
 
function countNodes(node: BSTNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}
 
// ─── Build BST ────────────────────────────────────────────────────────────────
export function computeBSTBuild(values: number[]): BSTOutput {
  if (!values.length) return { error: true, reason: "empty" };
  if (values.length > 30) return { error: true, reason: "too_large" };
  if (values.some(v => !isFinite(v))) return { error: true, reason: "invalid_values" };
 
  let root: BSTNode | null = null;
  const inserted: number[] = [];
  for (const v of values) {
    const before = countNodes(root);
    root = insertNode(root, v);
    if (countNodes(root) > before) inserted.push(v); // skip duplicates
  }
 
  if (!root) return { error: true, reason: "empty" };
 
  return {
    error: false,
    root,
    values: inserted,
    nodeCount: countNodes(root),
    height: getHeight(root),
    inorder:   getInorder(root),
    preorder:  getPreorder(root),
    postorder: getPostorder(root),
  };
}
 
// ─── Traversal ────────────────────────────────────────────────────────────────
export function computeTraversal(
  root: BSTNode,
  traversalType: TraversalType
): TraversalOutput {
  if (!root) return { error: true, reason: "empty" };
 
  const steps: TraversalStep[] = [];
  const path: number[] = [];
  const visited: number[] = [];
 
  const snap = (visiting: number, description: string) => {
    steps.push({
      iteration: steps.length + 1,
      visiting,
      visited: [...visited],
      path: [...path, visiting],
      description,
    });
  };
 
  if (traversalType === "inorder") {
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      if (node.left) {
        snap(node.val, `En nodo ${node.val}: ir a la izquierda (${node.left.val})`);
      } else {
        snap(node.val, `En nodo ${node.val}: sin hijo izquierdo, visitar`);
      }
      traverse(node.left);
      path.push(node.val);
      snap(node.val, `Visitar nodo ${node.val}`);
      visited.push(node.val);
      if (node.right) {
        snap(node.val, `En nodo ${node.val}: ir a la derecha (${node.right.val})`);
      }
      traverse(node.right);
    };
    traverse(root);
  }
 
  else if (traversalType === "preorder") {
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      path.push(node.val);
      snap(node.val, `Visitar nodo ${node.val} (raíz primero)`);
      visited.push(node.val);
      if (node.left) snap(node.val, `Ir al subárbol izquierdo de ${node.val}`);
      traverse(node.left);
      if (node.right) snap(node.val, `Ir al subárbol derecho de ${node.val}`);
      traverse(node.right);
    };
    traverse(root);
  }
 
  else if (traversalType === "postorder") {
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      if (node.left) snap(node.val, `En nodo ${node.val}: ir al subárbol izquierdo primero`);
      traverse(node.left);
      if (node.right) snap(node.val, `En nodo ${node.val}: ir al subárbol derecho`);
      traverse(node.right);
      path.push(node.val);
      snap(node.val, `Visitar nodo ${node.val} (hijos procesados)`);
      visited.push(node.val);
    };
    traverse(root);
  }
 
  // Final step
  steps.push({
    iteration: steps.length + 1,
    visiting: -1,
    visited: [...visited],
    path: [...path],
    description: `¡Recorrido ${TRAVERSAL_NAMES[traversalType]} completo! Secuencia: [${visited.join(", ")}]`,
  });
 
  return {
    error: false,
    traversalType,
    traversalName: TRAVERSAL_NAMES[traversalType],
    sequence: visited,
    steps,
  };
}
 
// ─── Rebuild from In-order + Pre-order ───────────────────────────────────────
function rebuildFromInPre(inorder: number[], preorder: number[]): BSTNode {
  if (!preorder.length) throw new Error("Preorder vacío inesperadamente");
  const rootVal = preorder[0];
  const idx = inorder.indexOf(rootVal);
  if (idx < 0) throw new Error(`Valor ${rootVal} del pre-order no encontrado en in-order`);
 
  const node: BSTNode = { val: rootVal, left: null, right: null };
  node.left  = inorder.slice(0, idx).length
    ? rebuildFromInPre(inorder.slice(0, idx), preorder.slice(1, 1 + idx))
    : null;
  node.right = inorder.slice(idx + 1).length
    ? rebuildFromInPre(inorder.slice(idx + 1), preorder.slice(1 + idx))
    : null;
  return node;
}
 
// ─── Rebuild from In-order + Post-order ──────────────────────────────────────
function rebuildFromInPost(inorder: number[], postorder: number[]): BSTNode {
  if (!postorder.length) throw new Error("Postorder vacío inesperadamente");
  const rootVal = postorder[postorder.length - 1];
  const idx = inorder.indexOf(rootVal);
  if (idx < 0) throw new Error(`Valor ${rootVal} del post-order no encontrado en in-order`);
 
  const node: BSTNode = { val: rootVal, left: null, right: null };
  node.left  = inorder.slice(0, idx).length
    ? rebuildFromInPost(inorder.slice(0, idx), postorder.slice(0, idx))
    : null;
  node.right = inorder.slice(idx + 1).length
    ? rebuildFromInPost(inorder.slice(idx + 1), postorder.slice(idx, postorder.length - 1))
    : null;
  return node;
}
 
export function computeRebuild(
  inorderSeq: number[],
  secondSeq: number[],
  mode: RebuildMode
): RebuildOutput {
  if (!inorderSeq.length || !secondSeq.length) return { error: true, reason: "empty" };
  if (inorderSeq.length !== secondSeq.length) return { error: true, reason: "length_mismatch" };
  if (inorderSeq.length > 30) return { error: true, reason: "too_large" };
  if ([...inorderSeq, ...secondSeq].some(v => !isFinite(v))) return { error: true, reason: "invalid_values" };
 
  const inSet  = new Set(inorderSeq);
  const secSet = new Set(secondSeq);
  if (inSet.size !== inorderSeq.length || secSet.size !== secondSeq.length) {
    return { error: true, reason: "duplicate_values" };
  }
  const allMatch = [...inSet].every(v => secSet.has(v)) && [...secSet].every(v => inSet.has(v));
  if (!allMatch) return { error: true, reason: "value_mismatch" };
 
  try {
    let root: BSTNode;
    if (mode === "inorder+preorder") {
      root = rebuildFromInPre(inorderSeq, secondSeq);
    } else {
      root = rebuildFromInPost(inorderSeq, secondSeq);
    }
 
    return {
      error: false,
      root,
      nodeCount: countNodes(root),
      height: getHeight(root),
      inorder:   getInorder(root),
      preorder:  getPreorder(root),
      postorder: getPostorder(root),
    };
  } catch (e: any) {
    return { error: true, reason: "rebuild_failed", message: e.message ?? "Error desconocido" };
  }
}