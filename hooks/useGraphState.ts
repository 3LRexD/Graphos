import { useRef } from "react";
import type { GraphState } from "@/types";

/**
 * Holds the mutable graph data in a ref so canvas event handlers always
 * see the latest version without triggering re-renders on every mouse move.
 *
 * Use the returned `graph` ref to read/write nodes and edges directly inside
 * canvas callbacks. Call `forceRedraw()` whenever you need the canvas to
 * repaint after a mutation.
 */
export function useGraphState() {
  const graph = useRef<GraphState>({
    nodes:          [],
    edges:          [],
    nodeIdCounter:  1,
    selectedNode:   null,
    isDragging:     false,
    tempStartNode:  null,
    mouseX:         0,
    mouseY:         0,
  });

  /** Resets the entire graph back to an empty state. */
  const clearGraph = () => {
    const d = graph.current;
    d.nodes          = [];
    d.edges          = [];
    d.nodeIdCounter  = 1;
    d.selectedNode   = null;
    d.isDragging     = false;
    d.tempStartNode  = null;
  };

  return { graph, clearGraph };
}