"use client";
import { useState, useEffect } from "react";
import type { GNode, GEdge } from "@/types";
import { P } from "@/components/canvas/palette";

interface Props {
  /** Si hay nodos en el grafo, los usamos como etiquetas iniciales */
  nodes: GNode[];
  edges: GEdge[];
  /** Callback cuando el usuario confirma la matriz — devuelve nodos y aristas sintéticos */
  onApply: (agents: string[], tasks: string[], matrix: number[][]) => void;
  onClose: () => void;
}

const MIN_SIZE = 2;
const MAX_SIZE = 8;

function makeMatrix(r: number, c: number, fill = 0): number[][] {
  return Array.from({ length: r }, () => new Array<number>(c).fill(fill));
}

export default function HungarianMatrixEditor({ nodes, edges, onApply, onClose }: Props) {
  const [rows,    setRows]    = useState(3);
  const [cols,    setCols]    = useState(3);
  const [agents,  setAgents]  = useState<string[]>(["A1", "A2", "A3"]);
  const [tasks,   setTasks]   = useState<string[]>(["T1", "T2", "T3"]);
  const [matrix,  setMatrix]  = useState<number[][]>(makeMatrix(3, 3, 0));
  const [source,  setSource]  = useState<"manual" | "graph">("manual");

  // ── Sync from graph if user picks "desde grafo" ───────────────────────────
  useEffect(() => {
    if (source !== "graph" || !nodes.length || !edges.length) return;

    // Detect bipartite partition
    const outSet = new Set(edges.map((e) => e.from.id));
    const inSet  = new Set(edges.map((e) => e.to.id));
    const agentNodes = nodes.filter((n) => outSet.has(n.id) && !inSet.has(n.id));
    const taskNodes  = nodes.filter((n) => inSet.has(n.id)  && !outSet.has(n.id));

    if (!agentNodes.length || !taskNodes.length) return;

    const newAgents = agentNodes.map((n) => n.label);
    const newTasks  = taskNodes.map((n)  => n.label);
    const newRows   = newAgents.length;
    const newCols   = newTasks.length;
    const newMatrix = makeMatrix(newRows, newCols, 0);

    edges.forEach((e) => {
      const r = agentNodes.findIndex((n) => n.id === e.from.id);
      const c = taskNodes.findIndex((n)  => n.id === e.to.id);
      if (r !== -1 && c !== -1) newMatrix[r][c] = parseFloat(e.weight) || 0;
    });

    setRows(newRows); setCols(newCols);
    setAgents(newAgents); setTasks(newTasks);
    setMatrix(newMatrix);
  }, [source, nodes, edges]);

  // ── Resize helpers ────────────────────────────────────────────────────────
  const changeRows = (n: number) => {
    const newR = Math.max(MIN_SIZE, Math.min(MAX_SIZE, n));
    setRows(newR);
    setAgents((prev) => {
      const a = [...prev];
      while (a.length < newR) a.push(`A${a.length + 1}`);
      return a.slice(0, newR);
    });
    setMatrix((prev) => {
      const m = prev.map((r) => [...r]);
      while (m.length < newR) m.push(new Array<number>(cols).fill(0));
      return m.slice(0, newR);
    });
  };

  const changeCols = (n: number) => {
    const newC = Math.max(MIN_SIZE, Math.min(MAX_SIZE, n));
    setCols(newC);
    setTasks((prev) => {
      const t = [...prev];
      while (t.length < newC) t.push(`T${t.length + 1}`);
      return t.slice(0, newC);
    });
    setMatrix((prev) =>
      prev.map((row) => {
        const r = [...row];
        while (r.length < newC) r.push(0);
        return r.slice(0, newC);
      })
    );
  };

  const setCell = (r: number, c: number, val: string) => {
    const num = parseFloat(val);
    setMatrix((prev) => {
      const m = prev.map((row) => [...row]);
      m[r][c] = isNaN(num) ? 0 : num;
      return m;
    });
  };

  const setAgent = (i: number, val: string) =>
    setAgents((prev) => { const a = [...prev]; a[i] = val.slice(0, 6); return a; });

  const setTask = (i: number, val: string) =>
    setTasks((prev) => { const t = [...prev]; t[i] = val.slice(0, 6); return t; });

  const handleApply = () => onApply(agents, tasks, matrix);

  // ── Styles ────────────────────────────────────────────────────────────────
  const cellInput: React.CSSProperties = {
    width: "52px", height: "36px",
    background: "#0e0e0e", color: P.white,
    border: `1px solid ${P.border}`, borderRadius: 3,
    textAlign: "center", fontSize: 13,
    fontFamily: "'Courier New', monospace",
    outline: "none",
  };
  const labelInput: React.CSSProperties = {
    width: "52px", height: "28px",
    background: "transparent", color: P.purpleBright,
    border: `1px solid ${P.border}`, borderRadius: 3,
    textAlign: "center", fontSize: 11,
    fontFamily: "'Courier New', monospace",
    outline: "none", fontWeight: "bold",
  };
  const btnNum: React.CSSProperties = {
    width: 24, height: 24, border: `1px solid ${P.border}`,
    borderRadius: 3, background: "transparent",
    color: P.muted, cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 110,
    }}>
      <div style={{
        background: "#111", border: `1px solid ${P.border}`,
        borderRadius: 10, padding: "1.6rem",
        boxShadow: "0 24px 64px rgba(0,0,0,0.95)",
        maxWidth: "95vw", maxHeight: "90vh",
        overflowY: "auto", minWidth: 340,
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted }}>MÉTODO HÚNGARO</div>
            <div style={{ color: P.text, fontSize: "1rem", marginTop: 3 }}>Editor de Matriz</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* ── Source toggle ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.2rem" }}>
          {(["manual", "graph"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              style={{
                flex: 1, padding: "7px 0",
                background: source === s ? P.purpleDim : "transparent",
                color:      source === s ? P.purple    : P.muted,
                border:     `1px solid ${source === s ? P.purple : P.border}`,
                borderRadius: 5, cursor: "pointer",
                fontFamily: "'Courier New', monospace", fontSize: 11,
              }}
            >
              {s === "manual" ? "✏ Manual" : "⛶ Desde grafo"}
            </button>
          ))}
        </div>

        {source === "graph" && (!nodes.length || !edges.length) && (
          <div style={{ color: P.muted, fontSize: 11, marginBottom: "1rem", textAlign: "center" }}>
            ⚠ Primero dibuja el grafo con agentes → tareas y sus pesos.
          </div>
        )}

        {/* ── Size controls ────────────────────────────────────────────────── */}
        {source === "manual" && (
          <div style={{ display: "flex", gap: 20, marginBottom: "1.2rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: P.muted, fontFamily: "'Courier New', monospace" }}>
              Agentes
              <button style={btnNum} onClick={() => changeRows(rows - 1)}>−</button>
              <span style={{ color: P.white, minWidth: 14, textAlign: "center" }}>{rows}</span>
              <button style={btnNum} onClick={() => changeRows(rows + 1)}>+</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: P.muted, fontFamily: "'Courier New', monospace" }}>
              Tareas
              <button style={btnNum} onClick={() => changeCols(cols - 1)}>−</button>
              <span style={{ color: P.white, minWidth: 14, textAlign: "center" }}>{cols}</span>
              <button style={btnNum} onClick={() => changeCols(cols + 1)}>+</button>
            </div>
          </div>
        )}

        {/* ── Matrix grid ──────────────────────────────────────────────────── */}
        <div style={{ overflowX: "auto", marginBottom: "1.4rem" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 4 }}>
            <thead>
              <tr>
                {/* top-left corner */}
                <td style={{ width: 52 }} />
                {tasks.map((t, c) => (
                  <td key={c} style={{ textAlign: "center" }}>
                    <input
                      style={labelInput}
                      value={t}
                      onChange={(e) => setTask(c, e.target.value)}
                      disabled={source === "graph"}
                    />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, r) => (
                <tr key={r}>
                  <td>
                    <input
                      style={labelInput}
                      value={agents[r] ?? `A${r + 1}`}
                      onChange={(e) => setAgent(r, e.target.value)}
                      disabled={source === "graph"}
                    />
                  </td>
                  {row.map((val, c) => (
                    <td key={c}>
                      <input
                        style={{
                          ...cellInput,
                          borderColor: val === 0 ? P.border : P.purple + "88",
                          color:       val === 0 ? P.muted  : P.white,
                        }}
                        type="number"
                        value={val}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        disabled={source === "graph"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Hint ─────────────────────────────────────────────────────────── */}
        <div style={{ fontSize: 10, color: P.muted, marginBottom: "1.2rem", lineHeight: 1.7, fontFamily: "'Courier New', monospace" }}>
          Filas = <span style={{ color: P.purpleBright }}>Agentes</span> &nbsp;·&nbsp;
          Columnas = <span style={{ color: P.cyan }}>Tareas</span> &nbsp;·&nbsp;
          Celdas = costo o ganancia
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px", background: "transparent",
              color: P.muted, border: `1px solid ${P.border}`,
              borderRadius: 5, cursor: "pointer",
              fontFamily: "'Courier New', monospace", fontSize: 12,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: "8px 22px", background: P.purple,
              color: P.bg, border: "none",
              borderRadius: 5, cursor: "pointer",
              fontFamily: "'Courier New', monospace", fontSize: 12,
              fontWeight: "bold",
            }}
          >
            ▶ Aplicar y Resolver
          </button>
        </div>
      </div>
    </div>
  );
}