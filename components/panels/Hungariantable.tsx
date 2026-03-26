"use client";
import type { HungarianOutput, HungarianResult } from "@/algorithms/hungarian";
import { P } from "@/components/canvas/palette";
import { emptyTxt } from "@/components/styles";

interface Props {
  result:   HungarianOutput;
  algoMode: string;
}

export default function HungarianTable({ result, algoMode }: Props) {
  const isMin       = algoMode === "hungarian-min";
  const accentColor = isMin ? P.cyan  : P.green;
  const accentDim   = isMin ? P.cyanDim : P.greenDim;

  // ── No result yet ──────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div style={{ color: P.muted, textAlign: "center", marginTop: "2rem", fontSize: 12, fontFamily: "'Courier New', monospace", lineHeight: 2 }}>
        <div style={{ fontSize: 14, marginBottom: 10, color: accentColor }}>
          {isMin ? "⬇ Asignación Mínima" : "⬆ Asignación Máxima"}
        </div>
        <div>Usa <strong style={{ color: P.purpleBright }}>⊞ Editar Matriz</strong> o</div>
        <div>dibuja aristas <strong style={{ color: P.purpleBright }}>Agente → Tarea</strong></div>
        <div style={{ marginTop: 10, fontSize: 11, color: "#444" }}>luego presiona ▶ Resolver</div>
      </div>
    );
  }

  // ── Errors ─────────────────────────────────────────────────────────────────
  if (result.error === "empty") {
    return <div style={emptyTxt}>No hay nodos en el lienzo.</div>;
  }
  if (result.error === "no_edges") {
    return <div style={emptyTxt}>Agrega aristas con pesos para continuar.</div>;
  }
  if (result.error === "not_bipartite") {
    return (
      <div style={{ color: P.red, textAlign: "center", marginTop: "2rem", fontSize: 12, fontFamily: "'Courier New', monospace", lineHeight: 1.8 }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>⚠</div>
        <div>El grafo no tiene estructura bipartita clara.</div>
        <div style={{ marginTop: 8, color: P.muted, fontSize: 11 }}>
          Dibuja aristas <strong>solo</strong> de Agentes → Tareas.
        </div>
      </div>
    );
  }

  // Narrow to HungarianResult (error === false)
  const res = result as HungarianResult;
  const { assignments, totalCost, matrix, agentNodes, taskNodes, steps } = res;

  return (
    <div style={{ fontFamily: "'Courier New', monospace" }}>

      {/* Mode badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.2rem" }}>
        <div style={{ padding: "5px 14px", borderRadius: 4, background: accentDim, border: `1px solid ${accentColor}44`, color: accentColor, fontSize: 11, letterSpacing: 1 }}>
          {isMin ? "⬇ MINIMIZAR" : "⬆ MAXIMIZAR"}
        </div>
        <div style={{ color: P.muted, fontSize: 11 }}>
          {agentNodes.length} agentes · {taskNodes.length} tareas
        </div>
      </div>

      {/* Cost matrix */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>MATRIZ DE COSTOS / GANANCIAS</div>
      <div style={{ overflowX: "auto", marginBottom: "1.4rem" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, color: P.text }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={{ padding: "6px 10px", color: P.muted, fontSize: 10 }}>↓ \ →</th>
              {taskNodes.map((t) => (
                <th key={t.id} style={{ padding: "6px 10px", color: P.purpleBright, textAlign: "center" }}>{t.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentNodes.map((agent, r) => (
              <tr key={agent.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "6px 10px", color: P.purpleBright, fontWeight: "bold" }}>{agent.label}</td>
                {taskNodes.map((task, c) => {
                  const isAssigned = assignments.some((a) => a.agentId === agent.id && a.taskId === task.id);
                  const val  = matrix[r]?.[c];
                  const isBig = val === undefined || val >= 1e8;
                  return (
                    <td key={task.id} style={{
                      padding: "6px 10px", textAlign: "center",
                      background:   isAssigned ? accentDim   : "transparent",
                      color:        isAssigned ? accentColor : isBig ? "#333" : P.text,
                      fontWeight:   isAssigned ? "bold"      : "normal",
                      border:       isAssigned ? `1px solid ${accentColor}55` : "1px solid transparent",
                      borderRadius: 3,
                    }}>
                      {isBig ? "—" : val}
                      {isAssigned && <span style={{ marginLeft: 3, fontSize: 9 }}>✓</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment list */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>ASIGNACIÓN ÓPTIMA</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.2rem" }}>
        {assignments.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#141414", border: `1px solid ${P.border}`, borderRadius: 5 }}>
            <span style={{ padding: "2px 10px", borderRadius: 4, background: P.purpleDim, border: `1px solid ${P.purple}55`, color: P.purpleBright, fontSize: 13, fontWeight: "bold" }}>
              {a.agentLabel}
            </span>
            <span style={{ color: accentColor, fontSize: 16 }}>→</span>
            <span style={{ padding: "2px 10px", borderRadius: 4, background: accentDim, border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 13, fontWeight: "bold" }}>
              {a.taskLabel}
            </span>
            <span style={{ marginLeft: "auto", color: P.muted, fontSize: 11 }}>
              {isMin ? "costo" : "ganancia"}:
              <strong style={{ color: accentColor, marginLeft: 5 }}>{a.cost}</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ padding: "10px 14px", borderRadius: 5, background: accentDim, border: `1px solid ${accentColor}44`, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
        <span style={{ color: P.muted, fontSize: 11 }}>{isMin ? "Costo Total Mínimo:" : "Ganancia Total Máxima:"}</span>
        <strong style={{ color: accentColor, fontSize: 15 }}>{totalCost} unidades</strong>
      </div>

      {/* Steps */}
      <details>
        <summary style={{ color: P.muted, fontSize: 11, cursor: "pointer", letterSpacing: 1, marginBottom: 10 }}>
          PASOS INTERMEDIOS ({steps.length})
        </summary>
        {steps.map((step, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: 10, color: P.purpleBright, marginBottom: 6, letterSpacing: 1 }}>
              {i + 1}. {step.description}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 10 }}>
                <tbody>
                  {step.matrix.map((row, r) => (
                    <tr key={r}>
                      {row.map((val, c) => (
                        <td key={c} style={{
                          padding: "4px 8px", textAlign: "center",
                          border:      `1px solid ${P.border}`,
                          color:       val === 0 ? accentColor : val >= 1e8 ? "#333" : P.muted,
                          fontWeight:  val === 0 ? "bold"      : "normal",
                          background:  val === 0 ? accentDim   : "transparent",
                        }}>
                          {val >= 1e8 ? "—" : val < 0 ? `(${Math.abs(val)})` : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </details>

    </div>
  );
}