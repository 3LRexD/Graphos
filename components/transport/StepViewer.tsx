"use client";

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
  purpleDim: "rgba(168,85,247,0.15)",
  cyan:      "#00e5ff",
  cyanDim:   "rgba(0,229,255,0.12)",
  red:       "#ff0055",
  redDim:    "rgba(255,0,85,0.12)",
  yellow:    "#ffd600",
  text:      "#E0E0E0",
  muted:     "#555",
};

export default function StepViewer({ result, currentStep, onNext, onPrev }: Props) {
  const { steps, rowLabels, colLabels, objective } = result;
  const step   = steps[currentStep] as TransportStep;
  const total  = steps.length;
  const isMin  = objective === "minimize";
  const accent = isMin ? P.red : P.purple;

  if (!step) return null;

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>

      {/* ── Controles de navegación ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", justifyContent: "center" }}>
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          style={navBtn(currentStep === 0)}
        >
          ← Anterior
        </button>

        <span style={{ color: P.muted, fontSize: 11 }}>
          Iteración{" "}
          <strong style={{ color: P.text }}>{currentStep + 1}</strong>
          {" "}de{" "}
          <strong style={{ color: P.text }}>{total}</strong>
        </span>

        <button
          onClick={onNext}
          disabled={currentStep === total - 1}
          style={navBtn(currentStep === total - 1)}
        >
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
        <span style={{ color: accent, marginRight: 8 }}>ⓘ</span>
        {step.description}
      </div>

      {/* ── Badges de info ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Cantidad",   value: step.units,     color: P.cyan   },
          { label: "Costo unit.", value: step.unitCost,  color: accent   },
          { label: `${isMin ? "Costo" : "Beneficio"} total`, value: step.stepCost, color: P.yellow },
        ].map(b => (
          <div key={b.label} style={{
            padding: "5px 12px", borderRadius: 4,
            background: `${b.color}15`, border: `1px solid ${b.color}44`,
            fontSize: 11,
          }}>
            <span style={{ color: P.muted }}>{b.label}: </span>
            <strong style={{ color: b.color }}>{b.value}</strong>
          </div>
        ))}
      </div>

      {/* ── Snapshot de matriz en este paso ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={thS} />
              {colLabels.map((l, j) => (
                <th key={j} style={{ ...thS, color: "#D8B4FE" }}>
                  D{j + 1}
                </th>
              ))}
              <th style={{ ...thS, color: P.cyan }}>Oferta Rest.</th>
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rl, i) => (
              <tr key={i} style={{ borderBottom: `1px solid #181818` }}>
                <td style={{ ...tdS, color: P.purple, fontWeight: "bold" }}>
                  O{i + 1}
                </td>
                {colLabels.map((_, j) => {
                  const isActive  = step.cell.row === i && step.cell.col === j;
                  const val       = step.matrixSnapshot[i]?.[j] ?? 0;
                  return (
                    <td key={j} style={{
                      ...tdS,
                      background: isActive ? `${accent}28` : val > 0 ? `${P.cyan}0e` : "transparent",
                      color:      isActive ? accent : val > 0 ? P.text : P.muted,
                      fontWeight: isActive ? "bold" : val > 0 ? "500" : "normal",
                      border:     isActive ? `2px solid ${accent}` : `1px solid #181818`,
                      borderRadius: isActive ? 3 : 0,
                    }}>
                      {val}
                      {isActive && (
                        <span style={{ fontSize: 8, display: "block", color: accent }}>
                          ({step.unitCost})
                        </span>
                      )}
                    </td>
                  );
                })}
                <td style={{ ...tdS, color: step.supplyLeft[i] === 0 ? P.muted : P.cyan }}>
                  {step.supplyLeft[i] === 0
                    ? <span style={{ color: P.muted }}>—</span>
                    : step.supplyLeft[i]}
                </td>
              </tr>
            ))}
            {/* Fila de demanda restante */}
            <tr style={{ borderTop: `1px solid ${P.border}` }}>
              <td style={{ ...tdS, color: P.red, fontSize: 9, letterSpacing: 1 }}>Dem. Rest.</td>
              {colLabels.map((_, j) => (
                <td key={j} style={{
                  ...tdS,
                  color: step.demandLeft[j] === 0 ? P.muted : P.red,
                }}>
                  {step.demandLeft[j] === 0
                    ? <span style={{ color: P.muted }}>—</span>
                    : step.demandLeft[j]}
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";

const thS: CSSProperties = {
  padding: "6px 10px", textAlign: "center",
  color: "#555", fontWeight: 400, fontSize: 10,
};

const tdS: CSSProperties = {
  padding: "8px 10px", textAlign: "center",
  fontSize: 12,
};

const navBtn = (disabled: boolean): CSSProperties => ({
  padding: "6px 16px",
  background:  disabled ? "transparent" : "rgba(168,85,247,0.12)",
  border:      `1px solid ${disabled ? "#2a2a2a" : "#A855F7"}`,
  borderRadius: 5,
  color:       disabled ? "#444" : "#A855F7",
  cursor:      disabled ? "not-allowed" : "pointer",
  fontFamily:  "'Courier New', monospace",
  fontSize:    11,
  transition:  "all 0.15s",
});