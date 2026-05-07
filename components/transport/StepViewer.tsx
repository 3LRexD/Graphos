"use client";

import type { CSSProperties } from "react";
import type { TransportResult, TransportStep } from "@/algorithms/northWest";

interface Props {
  result:      TransportResult;
  currentStep: number;
  onNext:      () => void;
  onPrev:      () => void;
}

const P = {
  border:    "#2a2a2a",
  purple:    "#A855F7",
  cyan:      "#00e5ff",
  red:       "#ff0055",
  yellow:    "#ffd600",
  yellowDim: "rgba(255,214,0,0.10)",
  green:     "#00ff88",
  text:      "#E0E0E0",
  muted:     "#555",
};

export default function StepViewer({ result, currentStep, onNext, onPrev }: Props) {
  const { steps, rowLabels, colLabels, objective, dummy } = result;
  const step  = steps[currentStep] as TransportStep;
  const total = steps.length;
  const isMin = objective === "minimize";
  const accent = step?.isDummy ? P.yellow : isMin ? P.red : P.purple;

  if (!step) return null;

  const isDummyRow = (i: number) => dummy?.type === "row" && i === dummy.index;
  const isDummyCol = (j: number) => dummy?.type === "col" && j === dummy.index;

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>

      {/* ── Controles ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", justifyContent: "center" }}>
        <button onClick={onPrev} disabled={currentStep === 0} style={navBtn(currentStep === 0)}>
          ← Anterior
        </button>
        <span style={{ color: P.muted, fontSize: 11 }}>
          Iteración <strong style={{ color: P.text }}>{currentStep + 1}</strong> de{" "}
          <strong style={{ color: P.text }}>{total}</strong>
        </span>
        <button onClick={onNext} disabled={currentStep === total - 1} style={navBtn(currentStep === total - 1)}>
          Siguiente →
        </button>
      </div>

      {/* ── Descripción del paso ── */}
      <div style={{
        padding: "10px 14px", marginBottom: "1rem",
        background: `${accent}18`,
        border: `1px solid ${accent}44`,
        borderRadius: 6, borderLeft: `3px solid ${accent}`,
        fontSize: 12, color: P.text,
      }}>
        {step.isDummy && (
          <span style={{ color: P.yellow, marginRight: 8, fontSize: 10, letterSpacing: 1 }}>
            ✦ FICTICIA
          </span>
        )}
        <span style={{ color: accent, marginRight: 8 }}>ⓘ</span>
        {step.description}
      </div>

      {/* ── Badges ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Cantidad",    value: step.units,    color: P.cyan   },
          { label: "Costo unit.", value: step.isDummy ? "0 (ficticia)" : step.unitCost, color: accent },
          { label: `${isMin ? "Costo" : "Beneficio"} paso`, value: step.isDummy ? "—" : step.stepCost, color: P.yellow },
        ].map(b => (
          <div key={b.label} style={{
            padding: "5px 12px", borderRadius: 4,
            background: `${b.color}15`, border: `1px solid ${b.color}44`, fontSize: 11,
          }}>
            <span style={{ color: P.muted }}>{b.label}: </span>
            <strong style={{ color: b.color }}>{b.value}</strong>
          </div>
        ))}
      </div>

      {/* ── Snapshot de la matriz ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={thS} />
              {colLabels.map((_, j) => (
                <th key={j} style={{
                  ...thS,
                  color: isDummyCol(j) ? P.yellow : "#D8B4FE",
                  fontStyle: isDummyCol(j) ? "italic" : "normal",
                }}>
                  {isDummyCol(j) ? "✦" : `D${j + 1}`}
                </th>
              ))}
              <th style={{ ...thS, color: P.cyan }}>Oferta Rest.</th>
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((_, i) => {
              const isDRow = isDummyRow(i);
              return (
                <tr key={i} style={{
                  borderBottom: `1px solid ${isDRow ? "rgba(255,214,0,0.12)" : "#181818"}`,
                  background:   isDRow ? "rgba(255,214,0,0.03)" : "transparent",
                }}>
                  <td style={{ ...tdS, color: isDRow ? P.yellow : P.purple, fontStyle: isDRow ? "italic" : "normal", fontWeight: "bold" }}>
                    {isDRow ? "✦" : `O${i + 1}`}
                  </td>
                  {colLabels.map((_, j) => {
                    const isDCol   = isDummyCol(j);
                    const isDCell  = isDRow || isDCol;
                    const isActive = step.cell.row === i && step.cell.col === j;
                    const val      = step.matrixSnapshot[i]?.[j] ?? 0;
                    return (
                      <td key={j} style={{
                        ...tdS,
                        background:   isActive
                          ? `${accent}28`
                          : isDCell && val > 0 ? P.yellowDim
                          : val > 0 ? "rgba(0,229,255,0.08)"
                          : "transparent",
                        color:     isActive ? accent : isDCell && val > 0 ? P.yellow : val > 0 ? P.text : P.muted,
                        fontWeight: isActive || val > 0 ? "bold" : "normal",
                        border:    isActive
                          ? `2px solid ${accent}`
                          : `1px solid ${isDCell ? "rgba(255,214,0,0.12)" : "#181818"}`,
                        borderRadius: isActive ? 3 : 0,
                      }}>
                        {val}
                        {isActive && (
                          <span style={{ fontSize: 8, display: "block", color: accent }}>
                            ({step.isDummy ? "0*" : step.unitCost})
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {/* Oferta restante */}
                  <td style={{ ...tdS, color: step.supplyLeft[i] === 0 ? P.muted : P.cyan }}>
                    {step.supplyLeft[i] === 0 ? "—" : step.supplyLeft[i]}
                  </td>
                </tr>
              );
            })}

            {/* Demanda restante */}
            <tr style={{ borderTop: `1px solid ${P.border}` }}>
              <td style={{ ...tdS, color: P.muted, fontSize: 9, letterSpacing: 1 }}>Dem. Rest.</td>
              {colLabels.map((_, j) => {
                const isDCol = isDummyCol(j);
                return (
                  <td key={j} style={{
                    ...tdS,
                    color: step.demandLeft[j] === 0 ? P.muted : isDCol ? P.yellow : P.red,
                  }}>
                    {step.demandLeft[j] === 0 ? "—" : step.demandLeft[j]}
                  </td>
                );
              })}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thS: CSSProperties = { padding: "6px 10px", textAlign: "center", color: "#555", fontWeight: 400, fontSize: 10 };
const tdS: CSSProperties = { padding: "8px 10px", textAlign: "center", fontSize: 12 };
const navBtn = (disabled: boolean): CSSProperties => ({
  padding: "6px 16px",
  background:   disabled ? "transparent" : "rgba(168,85,247,0.12)",
  border:       `1px solid ${disabled ? "#2a2a2a" : "#A855F7"}`,
  borderRadius: 5,
  color:        disabled ? "#444" : "#A855F7",
  cursor:       disabled ? "not-allowed" : "pointer",
  fontFamily:   "'Courier New', monospace",
  fontSize:     11,
  transition:   "all 0.15s",
});