"use client";
import type { GNode, GEdge, CPMOutput } from "../../types";
import { P } from "../canvas/palette";
import { emptyTxt } from "../styles";

interface Props {
  nodes: GNode[];
  edges: GEdge[];
  cpmResult: CPMOutput;
}

export default function ActivityTable({ nodes, edges, cpmResult }: Props) {
  // Only show nodes that participate in at least one edge
  const active = nodes
    .filter((n) => edges.some((e) => e.from.id === n.id || e.to.id === n.id))
    .sort((a, b) => a.id - b.id);

  if (!active.length) {
    return <div style={emptyTxt}>No hay actividades para mostrar.</div>;
  }

  const res = cpmResult && "error" in cpmResult && !cpmResult.error ? cpmResult : null;

  return (
    <div>
      {/* ── Activity list ─────────────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Courier New', monospace" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${P.red}` }}>
            {(["Actividad", "Predecesor", "Tiempo"] as const).map((h) => (
              <th key={h} style={{ padding: "13px 8px", color: P.red, fontWeight: "bold", fontSize: 13, textAlign: "center" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.map((nd, idx) => {
            const incoming = edges.filter((e) => e.to.id === nd.id);
            const preds    = incoming.map((e) => e.from.label).join(", ") || "-";
            const dur      = incoming.length > 0
              ? incoming[0].weight
              : (edges.find((e) => e.from.id === nd.id)?.weight || "0");
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${P.border}`,
                  background: idx % 2 === 0 ? "rgba(168,85,247,0.03)" : "transparent",
                }}
              >
                <td style={{ padding: "14px 8px", textAlign: "center", color: P.white, fontWeight: "bold", fontSize: 15 }}>
                  {nd.label}
                </td>
                <td style={{ padding: "14px 8px", textAlign: "center", color: P.muted, fontSize: 14 }}>
                  {preds}
                </td>
                <td style={{ padding: "14px 8px", textAlign: "center", color: P.cyan, fontWeight: "bold", fontSize: 15 }}>
                  {dur}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── CPM results ───────────────────────────────────────────────────── */}
      {res && (
        <div style={{ marginTop: "1.8rem" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 10, padding: "0 2px" }}>
            RESULTADOS FINALES — PERT/CPM
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Courier New', monospace", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Nodo", "TE", "TL", "Holgura", "Crítico"].map((h) => (
                  <th key={h} style={{ padding: "7px 5px", color: P.purpleBright, fontWeight: "400", fontSize: 10, textAlign: "center" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a, b) => a.id - b.id).map((nd, idx) => {
                const te    = res.TE[nd.id] ?? 0;
                const tl    = res.TL[nd.id] === Infinity ? Infinity : (res.TL[nd.id] ?? 0);
                const slack = tl === Infinity ? Infinity : tl - te;
                const isCrit = slack === 0;
                return (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #181818", background: isCrit ? P.redDim : "transparent" }}
                  >
                    <td style={{ padding: "7px 5px", textAlign: "center", color: isCrit ? P.red : P.text, fontWeight: isCrit ? "bold" : "normal" }}>
                      {nd.label}
                    </td>
                    <td style={{ padding: "7px 5px", textAlign: "center", color: P.cyan }}>{te}</td>
                    <td style={{ padding: "7px 5px", textAlign: "center", color: P.red }}>
                      {tl === Infinity ? "∞" : tl}
                    </td>
                    <td style={{ padding: "7px 5px", textAlign: "center", color: isCrit ? P.red : P.muted, fontWeight: isCrit ? "bold" : "normal" }}>
                      {slack === Infinity ? "∞" : slack}
                    </td>
                    <td style={{ padding: "7px 5px", textAlign: "center", color: isCrit ? P.red : P.muted, fontSize: 10 }}>
                      {isCrit ? "●" : "○"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{
            marginTop: 10, padding: "9px 12px",
            background: P.redDim, borderRadius: 5,
            border: `1px solid ${P.red}44`,
            display: "flex", justifyContent: "space-between",
            fontSize: 11, fontFamily: "'Courier New', monospace",
          }}>
            <span style={{ color: P.muted }}>Duración Total del Proyecto:</span>
            <strong style={{ color: P.red }}>{res.maxTE} unidades</strong>
          </div>
        </div>
      )}
    </div>
  );
}