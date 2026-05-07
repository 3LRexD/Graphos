"use client";

import type { CSSProperties } from "react";

interface Props {
  costs:       number[][];
  supply:      number[];
  demand:      number[];
  rowLabels:   string[];
  colLabels:   string[];
  totalSupply: number;
  totalDemand: number;
  onCostChange:   (r: number, c: number, v: number) => void;
  onSupplyChange: (r: number, v: number) => void;
  onDemandChange: (c: number, v: number) => void;
  onRowLabel:     (i: number, v: string) => void;
  onColLabel:     (j: number, v: string) => void;
}

const P = {
  border:    "#2a2a2a",
  purple:    "#A855F7",
  purpleDim: "rgba(168,85,247,0.08)",
  cyan:      "#00e5ff",
  cyanDim:   "rgba(0,229,255,0.06)",
  red:       "#ff0055",
  redDim:    "rgba(255,0,85,0.06)",
  green:     "#00ff88",
  yellow:    "#ffd600",
  text:      "#E0E0E0",
  muted:     "#555",
  surface:   "#111",
};

export default function TransportTable({
  costs, supply, demand, rowLabels, colLabels,
  totalSupply, totalDemand,
  onCostChange, onSupplyChange, onDemandChange,
  onRowLabel, onColLabel,
}: Props) {
  const diff       = totalSupply - totalDemand;
  const isBalanced = diff === 0;
  const needsDummy = diff !== 0;

  return (
    <div>
      {/* ── Banner de desequilibrio ── */}
      {needsDummy && (
        <div style={{
          marginBottom: 12, padding: "9px 14px",
          background:   "rgba(255,214,0,0.07)",
          border:       "1px solid rgba(255,214,0,0.35)",
          borderRadius: 7,
          display:      "flex", alignItems: "center", gap: 10,
          fontSize: 11, fontFamily: "'Courier New', monospace",
        }}>
          <span style={{ fontSize: 16 }}>⚠</span>
          <div>
            <span style={{ color: "#ffd600", fontWeight: "bold" }}>Problema desbalanceado — </span>
            <span style={{ color: P.muted }}>
              {diff > 0
                ? `Oferta excede demanda en ${diff} unidades. Se añadirá un Destino Ficticio al resolver.`
                : `Demanda excede oferta en ${Math.abs(diff)} unidades. Se añadirá un Origen Ficticio al resolver.`}
            </span>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "'Courier New', monospace", fontSize: 12, width: "100%" }}>
          <thead>
            <tr>
              <th style={thCorner} />
              {colLabels.map((label, j) => (
                <th key={j} style={thCol}>
                  <input value={label} onChange={e => onColLabel(j, e.target.value)} style={labelInput} />
                </th>
              ))}
              <th style={{ ...thCol, color: P.cyan }}>Oferta</th>
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rowLabel, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${P.border}` }}>
                <td style={tdRowLabel}>
                  <input value={rowLabel} onChange={e => onRowLabel(i, e.target.value)}
                    style={{ ...labelInput, color: P.purple }} />
                </td>
                {colLabels.map((_, j) => (
                  <td key={j} style={tdCell}>
                    <input type="number" min={0} value={costs[i]?.[j] ?? 0}
                      onChange={e => onCostChange(i, j, Number(e.target.value))}
                      style={numInput} />
                  </td>
                ))}
                <td style={{ ...tdCell, background: P.cyanDim }}>
                  <input type="number" min={0} value={supply[i] ?? 0}
                    onChange={e => onSupplyChange(i, Number(e.target.value))}
                    style={{ ...numInput, color: P.cyan, fontWeight: "bold" }} />
                </td>
              </tr>
            ))}

            {/* Fila demanda */}
            <tr style={{ borderTop: `2px solid ${P.border}` }}>
              <td style={{ ...tdRowLabel, color: P.red, fontWeight: "bold" }}>Demanda</td>
              {colLabels.map((_, j) => (
                <td key={j} style={{ ...tdCell, background: P.redDim }}>
                  <input type="number" min={0} value={demand[j] ?? 0}
                    onChange={e => onDemandChange(j, Number(e.target.value))}
                    style={{ ...numInput, color: P.red }} />
                </td>
              ))}

              {/* Totales */}
              <td style={{ ...tdCell, padding: "8px 10px", verticalAlign: "top" }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 2 }}>Σ Oferta</div>
                <div style={{ color: P.cyan, fontWeight: "bold", fontSize: 13 }}>{totalSupply}</div>
                <div style={{ fontSize: 10, color: P.muted, margin: "5px 0 2px" }}>Σ Demanda</div>
                <div style={{ color: P.red, fontWeight: "bold", fontSize: 13 }}>{totalDemand}</div>
                <div style={{
                  marginTop: 6, fontSize: 9, fontWeight: "bold", letterSpacing: 0.5,
                  color: isBalanced ? P.green : "#ffd600",
                }}>
                  {isBalanced ? "✓ Balanceado" : `${diff > 0 ? "+" : ""}${diff} unidades`}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const thCorner: CSSProperties = {
  width: 120, minWidth: 120, background: "#0d0d0d", border: "1px solid #1e1e1e",
};
const thCol: CSSProperties = {
  padding: "6px 4px", background: "#0d0d0d", border: "1px solid #1e1e1e",
  color: "#D8B4FE", fontWeight: 400, textAlign: "center", minWidth: 100,
};
const tdRowLabel: CSSProperties = {
  padding: "4px 8px", background: "#0d0d0d", border: "1px solid #1e1e1e",
  color: "#A855F7", textAlign: "center", fontWeight: "bold",
};
const tdCell: CSSProperties = { border: "1px solid #1e1e1e", padding: 0, textAlign: "center" };
const numInput: CSSProperties = {
  width: "100%", padding: "10px 6px", background: "transparent",
  border: "none", outline: "none", color: "#E0E0E0",
  textAlign: "center", fontFamily: "'Courier New', monospace", fontSize: 13,
};
const labelInput: CSSProperties = {
  background: "transparent", border: "none", outline: "none",
  color: "#D8B4FE", textAlign: "center",
  fontFamily: "'Courier New', monospace", fontSize: 11, width: "100%",
};