import type { GNode, GEdge, JohnsonOutput } from "@/types";

/**
 * Shortest path via Dijkstra (often called Johnson's in graph-theory courses).
 *
 * Finds the minimum-cost path from `originId` to `destId` using a simple
 * priority queue implemented with Array.sort. Works correctly for graphs
 * with non-negative edge weights.
 */
export function computeJohnson(
  nodes: GNode[],
  edges: GEdge[],
  originId: number,
  destId: number
): JohnsonOutput {
  // Build adjacency list
  const adj = new Map<number, { to: number; w: number; edge: GEdge }[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) =>
    adj.get(e.from.id)!.push({ to: e.to.id, w: parseFloat(e.weight) || 0, edge: e })
  );

  // Dijkstra initialisation
  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  const prevEdge: Record<number, GEdge | null> = {};
  nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    prevEdge[n.id] = null;
  });
  dist[originId] = 0;

  const visited = new Set<number>();
  const all = nodes.map((n) => n.id);

  while (all.length) {
    all.sort((a, b) => dist[a] - dist[b]);
    const u = all.shift()!;
    if (visited.has(u) || dist[u] === Infinity) continue;
    visited.add(u);
    if (u === destId) break;
    adj.get(u)!.forEach((e) => {
      if (!visited.has(e.to)) {
        const alt = dist[u] + e.w;
        if (alt < dist[e.to]) {
          dist[e.to] = alt;
          prev[e.to] = u;
          prevEdge[e.to] = e.edge;
        }
      }
    });
  }

  if (dist[destId] === Infinity) return { error: "no_path" };

  // Reconstruct path
  const pathEdges: GEdge[] = [];
  const pathNodes: number[] = [];
  let cur: number | null = destId;
  while (cur !== null && cur !== originId) {
    pathNodes.unshift(cur);
    if (prevEdge[cur]) pathEdges.unshift(prevEdge[cur]!);
    cur = prev[cur];
  }
  pathNodes.unshift(originId);

  return { error: false, dist, pathEdges, pathNodes, totalCost: dist[destId] };
}

/**
 * Cycle guard — returns true if adding an edge from→to would create a cycle.
 * Used before inserting a new edge in the canvas event handler.
 */
export function wouldCycle(
  nodes: GNode[],
  edges: GEdge[],
  fromId: number,
  toId: number
): boolean {
  const adj = new Map<number, number[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.from.id)?.push(e.to.id));

  // BFS: can we reach `fromId` starting from `toId`?
  const q = [toId];
  const visited = new Set<number>();
  while (q.length) {
    const u = q.shift()!;
    if (u === fromId) return true;
    if (visited.has(u)) continue;
    visited.add(u);
    adj.get(u)?.forEach((v) => q.push(v));
  }
  return false;
}