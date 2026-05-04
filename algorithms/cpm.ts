import type { GNode, GEdge, CPMOutput } from "../types";

export function computeCPM(nodes: GNode[], edges: GEdge[]): CPMOutput {
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

  // Forward pass — earliest times
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