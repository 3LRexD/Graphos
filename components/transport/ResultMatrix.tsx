"use client";

import type { CSSProperties } from "react";
import type { TransportResult } from "@/algorithms/northWest";

interface Props { result: TransportResult; }

const P = {
  border:    "#2a2a2a",
  purple:    "#A855F7",
  purpleDim: "rgba(168,85,247,0.12)",
  cyan:      "#00e5ff",
  cyanDim:   "rgba(0,229,255,0.14)",
  red:       "#ff0055",
  redDim:    "rgba(255,0,85,0.12)",
  yellow:    "#ffd600",
  yellowDim: "rgba(255,214,0,0.10)",
  orange:    "#ff9800",
  green:     "#00ff88",
  text:      "#E0E0E0",
  muted:     "#555",
};

export default function ResultMatrix({ result }: Props) {
  const {
    allocation, costs, totalCost,
    rowLabels, colLabels,
    supply, demand, supplyUsed, demandUsed,
    objective, isBalanced, method, dummy,
  } = result;

  const isMin   = objective === "minimize";
  const accent  = isMin ? P.red : P.purple;
  const accentD = isMin ? P.redDim : P.purpleDim;

  const isDummyRow = (i: number) => dummy?.type === "row" && i === dummy.index;
  const isDummyCol = (j: number) => dummy?.type === "col" && j === dummy.index;

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>

      {/* ── Banner ficticia ── */}
      {dummy && (
        <div style={{
          marginBottom: 14, padding: "10px 14px",
          background: P.yellowDim, border: "1px solid rgba(255,214,0,0.35)",
          borderRadius: 7, fontSize: 11,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>🧩</span>
          <div style={{ lineHeight: 1.7 }}>
            <span style={{ color: P.yellow, fontWeight: "bold" }}>
              {dummy.type === "col" ? "Destino Ficticio" : "Origen Ficticio"} añadido automáticamente.{" "}
            </span>
            <span style={{ color: P.muted }}>
              El problema estaba desbalanceado ({dummy.units} unidades de diferencia).
              {dummy.type === "col"
                ? " Se añadió una columna ficticia con costo 0 para absorber el exceso de oferta."
                : " Se añadió una fila ficticia con costo 0 para cubrir el exceso de demanda."}
              {" "}Las celdas marcadas con{" "}
            </span>
            <span style={{ color: P.yellow }}>✦</span>
            <span style={{ color: P.muted }}> pertenecen a la ficticia y no generan costo real.</span>
          </div>
        </div>
      )}

      {/* ── Resumen ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <Card label={isMin ? "COSTO MÍNIMO TOTAL" : "BENEFICIO MÁXIMO TOTAL"}
              value={totalCost} accent={accent} accentDim={accentD} big />
        <Card label="MÉTODO" value={method}
              subvalue={isMin ? "Minimización" : "Maximización"} accent={accent} accentDim={accentD} />
        <Card
          label="BALANCE"
          value={isBalanced ? "✓ Balanceado" : "⚠ Balanceado c/ ficticia"}
          accent={isBalanced ? P.green : P.yellow}
          accentDim={isBalanced ? "rgba(0,255,136,0.08)" : P.yellowDim}
          subvalue={dummy ? `+${dummy.units} unidades ficticias` : undefined}
        />
      </div>

      {/* ── Matriz final ── */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>
        MATRIZ DE ASIGNACIÓN FINAL
        {dummy && <span style={{ color: P.yellow, marginLeft: 10 }}>✦ = ficticia (costo 0)</span>}
      </div>
      <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
          <thead>
            <tr style={{ background: "#0d0d0d", borderBottom: `1px solid ${P.border}` }}>
              <th style={thS} />
              {colLabels.map((l, j) => (
                <th key={j} style={{
                  ...thS,
                  color: isDummyCol(j) ? P.yellow : "#D8B4FE",
                  fontStyle: isDummyCol(j) ? "italic" : "normal",
                }}>
                  {isDummyCol(j) ? "✦ " : ""}{l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rl, i) => {
              const isDRow = isDummyRow(i);
              return (
                <tr key={i} style={{
                  borderBottom: `1px solid ${isDRow ? "rgba(255,214,0,0.15)" : "#181818"}`,
                  background:   isDRow ? "rgba(255,214,0,0.04)" : "transparent",
                }}>
                  <td style={{
                    ...tdS, fontWeight: "bold",
                    color:      isDRow ? P.yellow : P.purple,
                    fontStyle:  isDRow ? "italic" : "normal",
                    background: "#0d0d0d",
                  }}>
                    {isDRow ? "✦ " : ""}{rl}
                  </td>
                  {colLabels.map((_, j) => {
                    const isDCol  = isDummyCol(j);
                    const isDCell = isDRow || isDCol;
                    const alloc   = allocation[i]?.[j] ?? 0;
                    const cost    = costs[i]?.[j] ?? 0;
                    const isUsed  = alloc > 0;
                    return (
                      <td key={j} style={{
                        ...tdS,
                        background:   isDCell
                          ? isUsed ? "rgba(255,214,0,0.10)" : "rgba(255,214,0,0.03)"
                          : isUsed ? P.cyanDim : "transparent",
                        color:       isUsed ? (isDCell ? P.yellow : P.text) : P.muted,
                        fontWeight:  isUsed ? "bold" : "normal",
                        border:      isUsed
                          ? `1px solid ${isDCell ? "rgba(255,214,0,0.35)" : P.cyan + "44"}`
                          : "1px solid #181818",
                        borderRadius: isUsed ? 3 : 0,
                      }}>
                        {isUsed ? (
                          <>
                            <div style={{ fontSize: 14 }}>{alloc}</div>
                            <div style={{ fontSize: 9, color: isDCell ? "rgba(255,214,0,0.6)" : P.cyan }}>
                              ({isDCell ? "0*" : cost})
                            </div>
                          </>
                        ) : <span>0</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Tabla de asignaciones reales (excluye ficticias) ── */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>
        ASIGNACIONES REALES
        <span style={{ color: "#444", marginLeft: 10 }}>(las ficticias no generan costo)</span>
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
              if ((allocation[i]?.[j] ?? 0) === 0) return null;
              if (isDummyRow(i) || isDummyCol(j)) return null; // excluir ficticias
              const alloc = allocation[i][j];
              const cost  = costs[i]?.[j] ?? 0;
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

      {/* Total real */}
      <div style={{
        marginTop: 10, padding: "9px 14px",
        background: accentD, borderRadius: 6,
        border: `1px solid ${accent}44`,
        display: "flex", justifyContent: "space-between", fontSize: 12,
      }}>
        <span style={{ color: P.muted }}>{isMin ? "Costo mínimo total (real):" : "Beneficio máximo total:"}</span>
        <strong style={{ color: accent }}>{totalCost} unidades</strong>
      </div>
    </div>
  );
}

// ─── Card helper ─────────────────────────────────────────────────────────────
function Card({ label, value, subvalue, accent, accentDim, big }:
  { label: string; value: any; subvalue?: string; accent: string; accentDim: string; big?: boolean }) {
  return (
    <div style={{
      flex: 1, minWidth: 150, padding: "12px 14px",
      background: accentDim, border: `1px solid ${accent}44`, borderRadius: 6,
    }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ color: accent, fontWeight: "bold", fontSize: big ? 22 : 13 }}>{value}</div>
      {subvalue && <div style={{ color: "#555", fontSize: 10, marginTop: 3 }}>{subvalue}</div>}
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const thS: CSSProperties = { padding: "7px 10px", textAlign: "center", color: "#555", fontWeight: 400, fontSize: 10 };
const tdS: CSSProperties = { padding: "9px 10px", textAlign: "center", fontSize: 12 };