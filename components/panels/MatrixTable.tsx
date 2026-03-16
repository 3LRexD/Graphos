"use client";
import type { GNode, GEdge } from "../../types";
import { P } from "../canvas/palette";

interface Props {
  nodes: GNode[];
  edges: GEdge[];
}

export default function MatrixTable({ nodes, edges }: Props) {
  if (nodes.length === 0) {
    return <div style={{ color: "#666", textAlign: "center", padding: "2rem", fontSize: 12 }}>El lienzo está vacío.</div>;
  }

  // 1. Ordenamos y preparamos la matriz vacía
  const sorted = [...nodes].sort((a, b) => a.id - b.id);
  const idxMap = new Map(sorted.map((n, i) => [n.id, i]));
  const mat = sorted.map(() => sorted.map(() => 0));

  // 2. Llenamos los pesos
  edges.forEach(e => {
    const fi = idxMap.get(e.from.id);
    const ti = idxMap.get(e.to.id);
    if (fi !== undefined && ti !== undefined) {
      mat[fi][ti] = parseFloat(e.weight) || 0;
    }
  });

  // 3. Cálculos tipo "Foto del amigo" pero más pro:
  // "Suma" (Σ) = Suma de los pesos de las aristas
  // "Grado" (Δ) = Cantidad de aristas que salen/entran
  const outSum = mat.map(row => row.reduce((a, b) => a + b, 0));
  const outDeg = mat.map(row => row.filter(v => v > 0).length);

  const inSum = sorted.map((_, j) => mat.reduce((s, row) => s + row[j], 0));
  const inDeg = sorted.map((_, j) => mat.filter(row => row[j] > 0).length);

  const activeRows = outDeg.filter(d => d > 0).length;
  const activeCols = inDeg.filter(d => d > 0).length;

  // Estilos limpios y hermosos (como los tenías antes)
  const cellStyle = { padding: "8px 12px", textAlign: "center" as const };
  const headerStyle = { ...cellStyle, color: P.purpleBright, fontWeight: "bold" };
  const metaStyle = { ...cellStyle, color: P.purpleBright, fontSize: 11, fontWeight: "bold" };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12, fontFamily: "'Courier New', monospace", color: P.text, width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}` }}>
            <th style={{ ...cellStyle, color: P.muted, fontSize: 10 }}>↓\→</th>
            {sorted.map(n => <th key={n.id} style={headerStyle}>{n.label}</th>)}
            <th style={{ ...metaStyle, borderLeft: `1px solid ${P.border}`, paddingLeft: 16 }}>Σ Suma</th>
            <th style={metaStyle}>Grado Out</th>
          </tr>
        </thead>
        
        <tbody>
          {/* Filas principales */}
          {sorted.map((nd, i) => (
            <tr key={nd.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
              <td style={headerStyle}>{nd.label}</td>
              
              {/* Celdas de la matriz (Morado para activos, punto para ceros) */}
              {mat[i].map((v, j) => (
                <td key={j} style={{
                  ...cellStyle,
                  background: v ? P.purpleDim : "transparent",
                  color: v ? P.white : P.muted,
                  fontWeight: v ? "bold" : "normal"
                }}>
                  {v || "·"}
                </td>
              ))}
              
              {/* Resultados de Salida */}
              <td style={{ ...cellStyle, borderLeft: `1px solid ${P.border}`, color: outSum[i] > 0 ? P.white : P.muted }}>{outSum[i] || "·"}</td>
              <td style={{ ...cellStyle, color: outDeg[i] > 0 ? P.purpleBright : P.muted }}>{outDeg[i] || "·"}</td>
            </tr>
          ))}
          
          {/* Fila de Suma (Pesos de entrada) */}
          <tr style={{ borderTop: `1px solid ${P.border}` }}>
            <td style={{ ...metaStyle, textAlign: "left" }}>Σ Suma</td>
            {inSum.map((v, j) => <td key={j} style={{ ...cellStyle, color: v > 0 ? P.white : P.muted }}>{v || "·"}</td>)}
            <td style={{ borderLeft: `1px solid ${P.border}` }}></td>
            <td></td>
          </tr>
          
          {/* Fila de Grados In (Cantidad de entradas) */}  
          <tr>
            <td style={{ ...metaStyle, textAlign: "left" }}>Grado In</td>
            {inDeg.map((v, j) => <td key={j} style={{ ...cellStyle, color: v > 0 ? P.purpleBright : P.muted }}>{v || "·"}</td>)}
            <td style={{ borderLeft: `1px solid ${P.border}` }}></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Resumen inferior (Diferente a tu amigo, pero dando la misma info) */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, padding: "10px 14px", background: "#111", borderRadius: "8px", border: "1px solid #222", fontSize: 11, color: P.muted, fontFamily: "'Courier New', monospace" }}>
        <span>Nodos con conexiones de salida: <strong style={{color: P.white}}>{activeRows}</strong> / {sorted.length}</span>
        <span>Nodos con conexiones de entrada: <strong style={{color: P.white}}>{activeCols}</strong> / {sorted.length}</span>
      </div>
    </div>
  );
}