import type { GNode, GEdge, KruskalOutput } from "@/types";

/**
 * Union-Find (Disjoint Set Union) data structure with path compression and union by rank
 * Used in Kruskal's algorithm to efficiently detect cycles
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  /**
   * Find the root of the set containing element x
   * Uses path compression for optimization
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * Union two sets containing elements x and y
   * Returns true if they were in different sets (union performed)
   * Returns false if they were already in the same set (would create cycle)
   */
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in same set — adding edge would create cycle
    }

    // Union by rank for optimization
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true; // Union successful
  }
}

/**
 * Kruskal's Algorithm for Minimum Spanning Tree (MST)
 * 
 * Algorithm:
 * 1. Sort all edges by weight (ascending)
 * 2. Initialize a Union-Find structure for cycle detection
 * 3. Iterate through sorted edges:
 *    - If edge connects two different components, add it to MST
 *    - Skip if edge would create a cycle
 * 4. Return when MST has V-1 edges (for V vertices)
 * 
 * Time Complexity: O(E log E) where E is number of edges
 * Space Complexity: O(V + E)
 * 
 * @param nodes - Array of graph nodes
 * @param edges - Array of graph edges with weights
 * @returns KruskalOutput with MST edges and total weight, or error
 */
export function computeKruskal(
  nodes: GNode[],
  edges: GEdge[]
): KruskalOutput {
  // Edge case: insufficient nodes
  if (nodes.length < 2) {
    return { error: "insufficient_nodes", mstEdges: [], totalWeight: 0 };
  }

  // If no edges, cannot form MST
  if (edges.length === 0) {
    return { error: "disconnected_graph", mstEdges: [], totalWeight: 0 };
  }

  // Create mapping from node ID to array index
  const nodeIdToIndex = new Map<number, number>();
  nodes.forEach((n, idx) => nodeIdToIndex.set(n.id, idx));

  // Sort edges by weight in ascending order (greedy selection)
  const sortedEdges = [...edges].sort((a, b) => {
    const weightA = parseFloat(a.weight) || 0;
    const weightB = parseFloat(b.weight) || 0;
    return weightA - weightB;
  });

  // Initialize Union-Find structure for cycle detection
  const uf = new UnionFind(nodes.length);
  const mstEdges: GEdge[] = [];
  let totalWeight = 0;

  // Main Kruskal loop: process sorted edges
  for (const edge of sortedEdges) {
    const fromIdx = nodeIdToIndex.get(edge.from.id);
    const toIdx = nodeIdToIndex.get(edge.to.id);

    // Skip if either endpoint node not found
    if (fromIdx === undefined || toIdx === undefined) continue;

    // Try to union the two components
    if (uf.union(fromIdx, toIdx)) {
      // Edge connects two different components — safe to add to MST
      mstEdges.push(edge);
      totalWeight += parseFloat(edge.weight) || 0;

      // MST is complete when we have V-1 edges
      if (mstEdges.length === nodes.length - 1) {
        break;
      }
    }
    // If union returns false, edge would create cycle — skip it
  }

  // Check if we successfully built a spanning tree
  // A spanning tree requires exactly V-1 edges for V vertices
  if (mstEdges.length !== nodes.length - 1) {
    // Graph is not fully connected
    return { error: "disconnected_graph", mstEdges: [], totalWeight: 0 };
  }

  return { error: false, mstEdges, totalWeight };
}