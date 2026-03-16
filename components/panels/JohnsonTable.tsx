"use client";
import type { GNode, JohnsonOutput } from "../../types";
import { P } from "../canvas/palette";
import { emptyTxt } from "../styles";

interface Props {
  nodes:      GNode[];
  originNode: GNode | null;
  destNode:   GNode | null;
  jStep:      "origin" | "dest" | "done";
  jResult:    JohnsonOutput;
}

export default function JohnsonTable({ nodes, originNode, destNode, jStep, jResult }: Props) {
  // ── No nodes selected yet ─────────────────────────────────────────────────
  if (!originNode || !destNode) {
    return (
      <div style={{ color: P.muted, textAlign: "center", marginTop: "2rem", fontSize: 12, fontFamily: "'Courier New', monospace", lineHeight: 1.9 }}>
        <div style={{ color: P.cyan, marginBottom: 10, fontSize: 14 }}>Algoritmo de Johnson</div>
        <div>Selecciona el nodo <span style={{ color: P.green }}>origen</span></div>
        <div>y luego el nodo <span style={{ color: P.red }}>destino</span></div>
        <div style={{ marginTop: 10, fontSize: 11, color: "#444" }}>haciendo clic en el grafo</div>
      </div>
    );
  }

  // ── Selection badges (always visible once both are chosen) ────────────────
  const selBadges = (
    <div style={{ display: "flex", gap: 10, marginBottom: "1rem" }}>
      <div style={{ flex: 1, padding: "8px 10px", background: P.greenDim, border: `1px solid ${P.green}44`, borderRadius: 5, fontSize: 11, fontFamily: "'Courier New', monospace" }}>
        <span style={{ color: P.muted }}>Origen: </span>
        <strong style={{ color: P.green }}>{originNode.label}</strong>
      </div>
      <div style={{ flex: 1, padding: "8px 10px", background: P.redDim, border: `1px solid ${P.red}44`, borderRadius: 5, fontSize: 11, fontFamily: "'Courier New', monospace" }}>
        <span style={{ color: P.muted }}>Destino: </span>
        <strong style={{ color: P.red }}>{destNode.label}</strong>
      </div>
    </div>
  );

  if (!jResult) {
    return (
      <>
        {selBadges}
        <div style={emptyTxt}>
          Presiona <strong style={{ color: P.cyan }}>▶ Resolver</strong> para calcular.
        </div>
      </>
    );
  }

  if (jResult.error === "no_path") {
    return (
      <>
        {selBadges}
        <div style={{ color: P.red, textAlign: "center", marginTop: "1.5rem", fontSize: 12 }}>
          No existe ruta entre los nodos seleccionados.
        </div>
      </>
    );
  }

  const res = jResult; // narrowed to JohnsonResult

  return (
    <div>
      {selBadges}

      {/* ── Optimal path visualization ──────────────────────────────────── */}
      <div style={{
        padding: "10px 12px", background: P.cyanDim,
        border: `1px solid ${P.cyan}44`, borderRadius: 5,
        marginBottom: "1rem", fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ fontSize: 9, color: P.muted, letterSpacing: 2, marginBottom: 6 }}>RUTA ÓPTIMA</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          {res.pathNodes.map((nid, i) => {
            const nd = nodes.find((n) => n.id === nid);
            return (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  padding: "3px 9px", background: "#1a1a1a",
                  border: `1px solid ${P.cyan}`, borderRadius: 4,
                  color: P.white, fontSize: 13, fontWeight: "bold",
                }}>
                  {nd?.label}
                </span>
                {i < res.pathNodes.length - 1 && <span style={{ color: P.cyan }}>→</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Distance table ──────────────────────────────────────────────── */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted, marginBottom: 8 }}>
        DISTANCIAS MÍNIMAS DESDE {originNode.label}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Courier New', monospace", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}` }}>
            {["Nodo", "Distancia Mínima", "En Ruta"].map((h) => (
              <th key={h} style={{ padding: "7px 5px", color: P.purpleBright, fontWeight: "400", fontSize: 10, textAlign: "center" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...nodes].sort((a, b) => a.id - b.id).map((nd, idx) => {
            const d      = res.dist[nd.id];
            const onPath = res.pathNodes.includes(nd.id);
            return (
              <tr
                key={idx}
                style={{ borderBottom: "1px solid #181818", background: onPath ? P.cyanDim : "transparent" }}
              >
                <td style={{ padding: "7px 5px", textAlign: "center", color: onPath ? P.white : P.text, fontWeight: onPath ? "bold" : "normal" }}>
                  {nd.label}
                </td>
                <td style={{ padding: "7px 5px", textAlign: "center", color: d === Infinity ? P.muted : P.cyan }}>
                  {d === Infinity ? "∞" : d}
                </td>
                <td style={{ padding: "7px 5px", textAlign: "center", color: onPath ? P.cyan : P.muted, fontSize: 10 }}>
                  {onPath ? "●" : "○"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{
        marginTop: 10, padding: "9px 12px",
        background: P.cyanDim, borderRadius: 5,
        border: `1px solid ${P.cyan}44`,
        display: "flex", justifyContent: "space-between",
        fontSize: 11, fontFamily: "'Courier New', monospace",
      }}>
        <span style={{ color: P.muted }}>Costo Total Mínimo:</span>
        <strong style={{ color: P.cyan }}>{res.totalCost} unidades</strong>
      </div>
    </div>
  );
}