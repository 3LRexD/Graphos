"use client";
import type { GNode, GEdge } from "../../types";
import { P } from "../canvas/palette";
import { emptyTxt } from "../styles";

interface Props {
  nodes: GNode[];
  edges: GEdge[];
}

export default function MatrixTable({ nodes, edges }: Props) {
  if (!nodes.length) {
    return <div style={emptyTxt}>No hay nodos en el lienzo.</div>;
  }

  const sorted = [...nodes].sort((a, b) => a.id - b.id);
  const idxMap = new Map(sorted.map((n, i) => [n.id, i]));

  // Build N×N matrix
  const mat = sorted.map(() => sorted.map(() => 0));
  edges.forEach((e) => {
    const fi = idxMap.get(e.from.id);
    const ti = idxMap.get(e.to.id);
    if (fi !== undefined && ti !== undefined) mat[fi][ti] = parseFloat(e.weight) || 0;
  });

  const outDeg = mat.map((row) => row.reduce((a, b) => a + b, 0));
  const inDeg  = sorted.map((_, j) => mat.reduce((s, row) => s + row[j], 0));

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: "'Courier New', monospace", color: P.text }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}` }}>
            <th style={{ padding: "7px 9px", color: P.muted, fontSize: 10 }}>↓\→</th>
            {sorted.map((n) => (
              <th key={n.id} style={{ padding: "7px 9px", color: P.purpleBright, textAlign: "center" }}>
                {n.label}
              </th>
            ))}
            <th style={{ padding: "7px 9px", color: P.muted, borderLeft: `1px solid ${P.border}` }}>Out</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((nd, i) => (
            <tr key={nd.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
              <td style={{ padding: "7px 9px", color: P.purpleBright, fontWeight: "bold" }}>{nd.label}</td>
              {mat[i].map((v, j) => (
                <td
                  key={j}
                  style={{
                    padding: "7px 9px", textAlign: "center",
                    background: v ? P.purpleDim : "transparent",
                    color:      v ? P.white : P.muted,
                  }}
                >
                  {v || "·"}
                </td>
              ))}
              <td style={{ padding: "7px 9px", textAlign: "center", borderLeft: `1px solid ${P.border}`, color: outDeg[i] > 0 ? P.purple : P.muted }}>
                {outDeg[i]}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: `1px solid ${P.border}` }}>
            <td style={{ padding: "7px 9px", color: P.muted, fontSize: 10 }}>In</td>
            {inDeg.map((v, j) => (
              <td key={j} style={{ padding: "7px 9px", textAlign: "center", color: v > 0 ? P.purple : P.muted }}>
                {v}
              </td>
            ))}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}