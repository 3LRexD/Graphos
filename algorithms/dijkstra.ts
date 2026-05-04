import type { GNode, GEdge, DijkstraMinOutput, DijkstraMaxOutput } from "@/types";

/**
 * Dijkstra Algorithm - Shortest Path (Minimizar)
 * Finds the minimum-cost path from `originId` to `destId` using Dijkstra's algorithm
 */
export function computeDijkstraMin(
  nodes: GNode[],
  edges: GEdge[],
  originId: number,
  destId: number
): DijkstraMinOutput {
  // Build adjacency list
  const adj = new Map<number, { to: number; w: number; edge: GEdge }[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) =>
    adj.get(e.from.id)!.push({ to: e.to.id, w: parseFloat(e.weight) || 0, edge: e })
  );

  // Dijkstra initialization
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
 * Dijkstra Algorithm - Longest Path (Maximizar)
 * Uses CPM-like structure (TE, TL, critEdges) for consistency with johnson-max
 * Finds the maximum-cost path from origin to all nodes in a DAG
 */
export function computeDijkstraMax(
  nodes: GNode[],
  edges: GEdge[]
): DijkstraMaxOutput {
  if (!nodes.length) return null;

  const adj = new Map<number, { to: number; w: number; edge: GEdge }[]>();
  const inDeg = new Map<number, number>();
  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  });
  edges.forEach((e) => {
    adj.get(e.from.id)!.push({ to: e.to.id, w: parseFloat(e.weight) || 0, edge: e });
    inDeg.set(e.to.id, (inDeg.get(e.to.id) || 0) + 1);
  });

  // Topological sort
  const q: number[] = [];
  inDeg.forEach((d, id) => { if (d === 0) q.push(id); });
  const topo: number[] = [];
  const tmp = new Map(inDeg);
  while (q.length) {
    const u = q.shift()!;
    topo.push(u);
    adj.get(u)!.forEach((e) => {
      const nd = (tmp.get(e.to) || 0) - 1;
      tmp.set(e.to, nd);
      if (nd === 0) q.push(e.to);
    });
  }
  if (topo.length !== nodes.length) return { error: true };

  // Forward pass — earliest times (maximize)
  const TE: Record<number, number> = {};
  const TL: Record<number, number> = {};
  nodes.forEach((n) => { TE[n.id] = 0; TL[n.id] = Infinity; });
  topo.forEach((u) =>
    adj.get(u)!.forEach((e) => {
      if (TE[u] + e.w > TE[e.to]) TE[e.to] = TE[u] + e.w;
    })
  );

  const maxTE = Math.max(...Object.values(TE), 0);
  nodes.forEach((n) => { TL[n.id] = maxTE; });
  [...topo].reverse().forEach((u) =>
    adj.get(u)!.forEach((e) => {
      if (TL[e.to] - e.w < TL[u]) TL[u] = TL[e.to] - e.w;
    })
  );

  const critEdges = new Set<GEdge>();
  edges.forEach((e) => {
    const w = parseFloat(e.weight) || 0;
    if (
      Math.abs(TE[e.from.id] - TL[e.from.id]) < 0.001 &&
      Math.abs(TE[e.from.id] + w - TL[e.to.id]) < 0.001
    ) {
      critEdges.add(e);
    }
  });

  return { error: false, TE, TL, maxTE, critEdges, topo };
}