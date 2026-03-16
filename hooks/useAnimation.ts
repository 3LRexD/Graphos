import { useState, useCallback } from "react";
import type { GEdge, CPMResult, JohnsonResult } from "@/types";

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Manages animated highlighting of edges and nodes during algorithm playback.
 */
export function useAnimation() {
  const [animEdges, setAnimEdges]   = useState<Set<GEdge>>(new Set());
  const [animNodes, setAnimNodes]   = useState<Set<number>>(new Set());
  const [isAnimating, setAnimating] = useState(false);

  const resetAnim = useCallback(() => {
    setAnimEdges(new Set());
    setAnimNodes(new Set());
  }, []);

  /** Animate the critical path, edge by edge. */
  const animateCPM = useCallback(async (res: CPMResult) => {
    setAnimating(true);
    const cArr = [...res.critEdges];
    setAnimEdges(new Set());
    setAnimNodes(new Set());
    for (let i = 0; i <= cArr.length; i++) {
      const pe = new Set<GEdge>(cArr.slice(0, i));
      const pn = new Set<number>();
      cArr.slice(0, i).forEach((e) => { pn.add(e.from.id); pn.add(e.to.id); });
      setAnimEdges(pe);
      setAnimNodes(pn);
      await sleep(380);
    }
    setAnimating(false);
  }, []);

  /** Animate the shortest path, node by node. */
  const animateJohnson = useCallback(async (res: JohnsonResult) => {
    setAnimating(true);
    setAnimEdges(new Set());
    setAnimNodes(new Set());
    for (let i = 0; i <= res.pathEdges.length; i++) {
      setAnimEdges(new Set(res.pathEdges.slice(0, i)));
      setAnimNodes(new Set(res.pathNodes.slice(0, i + 1)));
      await sleep(420);
    }
    setAnimating(false);
  }, []);

  return { animEdges, animNodes, isAnimating, animateCPM, animateJohnson, resetAnim };
}