"use client";

interface Props {
  costs:      number[][];
  supply:     number[];
  demand:     number[];
  rowLabels:  string[];
  colLabels:  string[];
  totalSupply: number;
  totalDemand: number;
  onCostChange:   (r: number, c: number, v: number) => void;
  onSupplyChange: (r: number, v: number) => void;
  onDemandChange: (c: number, v: number) => void;
  onRowLabel:     (i: number, v: string) => void;
  onColLabel:     (j: number, v: string) => void;
}

// ─── Paleta compartida con el resto del proyecto ──────────────────────────────
const P = {
  bg:          "#0a0a0a",
  surface:     "#111111",
  surfaceHigh: "#1a1a1a",
  border:      "#2a2a2a",
  purple:      "#A855F7",
  purpleDim:   "rgba(168,85,247,0.15)",
  cyan:        "#00e5ff",
  red:         "#ff0055",
  green:       "#00ff88",
  text:        "#E0E0E0",
  muted:       "#555",
};

export default function TransportTable({
  costs, supply, demand, rowLabels, colLabels,
  totalSupply, totalDemand,
  onCostChange, onSupplyChange, onDemandChange,
  onRowLabel, onColLabel,
}: Props) {
  const isBalanced = totalSupply === totalDemand;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontFamily: "'Courier New', monospace", fontSize: 12, width: "100%" }}>
        <thead>
          <tr>
            {/* Celda vacía esquina superior izquierda */}
            <th style={thCorner} />

            {/* Encabezados de columna (editables) */}
            {colLabels.map((label, j) => (
              <th key={j} style={thCol}>
                <input
                  value={label}
                  onChange={e => onColLabel(j, e.target.value)}
                  style={labelInput}
                />
              </th>
            ))}

            {/* Columna Oferta */}
            <th style={{ ...thCol, color: P.cyan }}>Oferta</th>
          </tr>
        </thead>

        <tbody>
          {/* Filas de costos + oferta */}
          {rowLabels.map((rowLabel, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${P.border}` }}>
              {/* Etiqueta fila (editable) */}
              <td style={tdRowLabel}>
                <input
                  value={rowLabel}
                  onChange={e => onRowLabel(i, e.target.value)}
                  style={{ ...labelInput, color: P.purple }}
                />
              </td>

              {/* Celdas de costo */}
              {colLabels.map((_, j) => (
                <td key={j} style={tdCell}>
                  <input
                    type="number"
                    min={0}
                    value={costs[i]?.[j] ?? 0}
                    onChange={e => onCostChange(i, j, Number(e.target.value))}
                    style={numInput}
                  />
                </td>
              ))}

              {/* Oferta de este origen */}
              <td style={{ ...tdCell, background: "rgba(0,229,255,0.05)" }}>
                <input
                  type="number"
                  min={0}
                  value={supply[i] ?? 0}
                  onChange={e => onSupplyChange(i, Number(e.target.value))}
                  style={{ ...numInput, color: P.cyan, fontWeight: "bold" }}
                />
              </td>
            </tr>
          ))}

          {/* Fila de demanda */}
          <tr style={{ borderTop: `2px solid ${P.border}` }}>
            <td style={{ ...tdRowLabel, color: P.red, fontWeight: "bold" }}>Demanda</td>

            {colLabels.map((_, j) => (
              <td key={j} style={{ ...tdCell, background: "rgba(255,0,85,0.04)" }}>
                <input
                  type="number"
                  min={0}
                  value={demand[j] ?? 0}
                  onChange={e => onDemandChange(j, Number(e.target.value))}
                  style={{ ...numInput, color: P.red }}
                />
              </td>
            ))}

            {/* Totales: oferta vs demanda */}
            <td style={{ ...tdCell, verticalAlign: "top", padding: "6px 8px" }}>
              <div style={{ fontSize: 10, color: P.muted, marginBottom: 2 }}>Σ Oferta:</div>
              <div style={{ color: P.cyan, fontWeight: "bold" }}>{totalSupply}</div>
              <div style={{ fontSize: 10, color: P.muted, marginTop: 4, marginBottom: 2 }}>Σ Demanda:</div>
              <div style={{ color: P.red, fontWeight: "bold" }}>{totalDemand}</div>
              {/* Indicador de balance */}
              <div style={{
                marginTop: 6, fontSize: 9, letterSpacing: 0.5,
                color: isBalanced ? P.green : "#ffd600",
                fontWeight: "bold",
              }}>
                {isBalanced ? "✓ Balanceado" : "⚠ No balanceado"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";

const thCorner: CSSProperties = {
  width: 120, minWidth: 120,
  background: "#0d0d0d",
  border: `1px solid #1e1e1e`,
};

const thCol: CSSProperties = {
  padding: "6px 4px",
  background: "#0d0d0d",
  border: `1px solid #1e1e1e`,
  color: "#D8B4FE",
  fontWeight: 400,
  textAlign: "center",
  minWidth: 100,
};

const tdRowLabel: CSSProperties = {
  padding: "4px 8px",
  background: "#0d0d0d",
  border: `1px solid #1e1e1e`,
  color: "#A855F7",
  textAlign: "center",
  fontWeight: "bold",
};

const tdCell: CSSProperties = {
  border: `1px solid #1e1e1e`,
  padding: 0,
  textAlign: "center",
};

const numInput: CSSProperties = {
  width: "100%",
  padding: "10px 6px",
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#E0E0E0",
  textAlign: "center",
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
};

const labelInput: CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#D8B4FE",
  textAlign: "center",
  fontFamily: "'Courier New', monospace",
  fontSize: 11,
  width: "100%",
};