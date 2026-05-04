"use client";

import type { TransportResult } from "@/algorithms/northWest";

interface Props {
  result: TransportResult;
}

const P = {
  border:  "#2a2a2a",
  purple:  "#A855F7",
  cyan:    "#00e5ff",
  cyanDim: "rgba(0,229,255,0.14)",
  red:     "#ff0055",
  redDim:  "rgba(255,0,85,0.12)",
  yellow:  "#ffd600",
  green:   "#00ff88",
  text:    "#E0E0E0",
  muted:   "#555",
};

export default function ResultMatrix({ result }: Props) {
  const { allocation, costs, totalCost, rowLabels, colLabels, objective, isBalanced, method } = result;
  const isMin  = objective === "minimize";
  const accent = isMin ? P.red : P.purple;
  const label  = isMin ? "Costo Total Mínimo" : "Beneficio Total Máximo";

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>

      {/* ── Resumen superior ── */}
      <div style={{
        display: "flex", gap: 12, marginBottom: "1.2rem", flexWrap: "wrap",
      }}>
        {/* Total */}
        <div style={{
          flex: 1, minWidth: 160, padding: "12px 16px",
          background: `${accent}18`, border: `1px solid ${accent}44`,
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 9, color: P.muted, letterSpacing: 2, marginBottom: 4 }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: accent }}>{totalCost}</div>
        </div>

        {/* Método */}
        <div style={{
          flex: 1, minWidth: 160, padding: "12px 16px",
          background: "rgba(255,255,255,0.02)", border: `1px solid #1e1e1e`,
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 9, color: P.muted, letterSpacing: 2, marginBottom: 4 }}>MÉTODO</div>
          <div style={{ color: accent, fontWeight: "bold", fontSize: 13 }}>{method}</div>
          <div style={{ color: P.muted, fontSize: 10, marginTop: 3 }}>
            {isMin ? "Minimización" : "Maximización"}
          </div>
        </div>

        {/* Balance */}
        <div style={{
          flex: 1, minWidth: 160, padding: "12px 16px",
          background: isBalanced ? "rgba(0,255,136,0.06)" : "rgba(255,214,0,0.06)",
          border: `1px solid ${isBalanced ? P.green : P.yellow}44`,
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 9, color: P.muted, letterSpacing: 2, marginBottom: 4 }}>BALANCE</div>
          <div style={{ color: isBalanced ? P.green : P.yellow, fontWeight: "bold", fontSize: 13 }}>
            {isBalanced ? "✓ Balanceado" : "⚠ No balanceado"}
          </div>
          {!isBalanced && (
            <div style={{ color: P.muted, fontSize: 10, marginTop: 3 }}>
              Solución puede no ser óptima
            </div>
          )}
        </div>
      </div>

      {/* ── Matriz de asignación final ── */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>
        MATRIZ DE ASIGNACIÓN FINAL
      </div>
      <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
          <thead>
            <tr style={{ background: "#0d0d0d", borderBottom: `1px solid ${P.border}` }}>
              <th style={thS} />
              {colLabels.map((l, j) => (
                <th key={j} style={{ ...thS, color: "#D8B4FE" }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rl, i) => (
              <tr key={i} style={{ borderBottom: `1px solid #181818` }}>
                <td style={{ ...tdS, color: P.purple, fontWeight: "bold", background: "#0d0d0d" }}>
                  {rl}
                </td>
                {colLabels.map((_, j) => {
                  const alloc = allocation[i]?.[j] ?? 0;
                  const cost  = costs[i]?.[j] ?? 0;
                  const isUsed = alloc > 0;
                  return (
                    <td key={j} style={{
                      ...tdS,
                      background:   isUsed ? P.cyanDim : "transparent",
                      color:        isUsed ? P.text   : P.muted,
                      fontWeight:   isUsed ? "bold"   : "normal",
                      border:       isUsed ? `1px solid ${P.cyan}44` : `1px solid #181818`,
                      borderRadius: isUsed ? 3 : 0,
                    }}>
                      {isUsed ? (
                        <>
                          <div style={{ fontSize: 14 }}>{alloc}</div>
                          <div style={{ fontSize: 9, color: P.cyan }}>({cost})</div>
                        </>
                      ) : (
                        <span style={{ fontSize: 12 }}>0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Tabla de asignaciones individuales ── */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>
        ASIGNACIONES INDIVIDUALES
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}` }}>
            {["Origen", "Destino", "Unidades", "Costo unit.", "Subtotal"].map(h => (
              <th key={h} style={{ ...thS, color: "#A855F7" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.flatMap((rl, i) =>
            colLabels.map((cl, j) => {
              const alloc = allocation[i]?.[j] ?? 0;
              if (alloc === 0) return null;
              const cost = costs[i]?.[j] ?? 0;
              return (
                <tr key={`${i}-${j}`} style={{ borderBottom: "1px solid #181818" }}>
                  <td style={{ ...tdS, color: P.purple }}>{rl}</td>
                  <td style={{ ...tdS, color: "#D8B4FE" }}>{cl}</td>
                  <td style={{ ...tdS, color: P.cyan, fontWeight: "bold" }}>{alloc}</td>
                  <td style={{ ...tdS, color: P.text }}>{cost}</td>
                  <td style={{ ...tdS, color: accent, fontWeight: "bold" }}>{alloc * cost}</td>
                </tr>
              );
            }).filter(Boolean)
          )}
        </tbody>
      </table>

      {/* ── Total final ── */}
      <div style={{
        marginTop: "1rem", padding: "10px 14px",
        background: `${accent}15`, borderRadius: 6,
        border: `1px solid ${accent}44`,
        display: "flex", justifyContent: "space-between", fontSize: 12,
      }}>
        <span style={{ color: P.muted }}>{label}:</span>
        <strong style={{ color: accent }}>{totalCost} unidades</strong>
      </div>
    </div>
  );
}

import type { CSSProperties } from "react";

const thS: CSSProperties = {
  padding: "7px 10px", textAlign: "center",
  color: "#555", fontWeight: 400, fontSize: 10,
};

const tdS: CSSProperties = {
  padding: "9px 10px", textAlign: "center",
  fontSize: 12,
};