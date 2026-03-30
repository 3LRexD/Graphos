"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import type { GNode, GEdge } from "@/types";
import { P } from "@/components/canvas/palette";

interface Props {
  nodes:    GNode[];
  edges:    GEdge[];
  algoMode: string;
  onClose:  () => void;
  /** Called when user edits matrix manually and wants to apply */
  onApply?: (agentLabels: string[], taskLabels: string[], matrix: number[][]) => void;
}

type Tab = "adjacency" | "costs";

// ── Dragging and resizing logic ───────────────────────────────────────────────
function useWindowDrag(initX: number, initY: number) {
  const [pos, setPos] = useState({ x: initX, y: initY });
  const dragging = useRef(false);
  const origin   = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    origin.current   = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: origin.current.wx + e.clientX - origin.current.mx,
        y: origin.current.wy + e.clientY - origin.current.my,
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return { pos, onMouseDown };
}

function useWindowResize(initW: number, initH: number) {
  const [size, setSize] = useState({ w: initW, h: initH });
  const resizing = useRef(false);
  const origin   = useRef({ mx: 0, my: 0, ww: 0, wh: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    resizing.current = true;
    origin.current   = { mx: e.clientX, my: e.clientY, ww: size.w, wh: size.h };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      setSize({
        w: Math.max(340, origin.current.ww + e.clientX - origin.current.mx),
        h: Math.max(260, origin.current.wh + e.clientY - origin.current.my),
      });
    };
    const onUp = () => { resizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return { size, onMouseDown };
}

// ── Matrix builders ───────────────────────────────────────────────────────────
function buildAdjMatrix(nodes: GNode[], edges: GEdge[]) {
  const sorted = [...nodes].sort((a, b) => a.id - b.id);
  const idx    = new Map(sorted.map((n, i) => [n.id, i]));
  const mat    = sorted.map(() => sorted.map(() => 0));
  edges.forEach((e) => {
    const r = idx.get(e.from.id), c = idx.get(e.to.id);
    if (r !== undefined && c !== undefined) mat[r][c] = parseFloat(e.weight) || 1;
  });
  return { sorted, mat };
}

function buildCostMatrix(nodes: GNode[], edges: GEdge[]) {
  const outSet    = new Set(edges.map((e) => e.from.id));
  const inSet     = new Set(edges.map((e) => e.to.id));
  const agents    = nodes.filter((n) => outSet.has(n.id) && !inSet.has(n.id)).sort((a, b) => a.id - b.id);
  const tasks     = nodes.filter((n) => inSet.has(n.id)  && !outSet.has(n.id)).sort((a, b) => a.id - b.id);
  if (!agents.length || !tasks.length) return null;
  const mat = agents.map(() => tasks.map(() => 0 as number));
  edges.forEach((e) => {
    const r = agents.findIndex((n) => n.id === e.from.id);
    const c = tasks.findIndex((n)  => n.id === e.to.id);
    if (r !== -1 && c !== -1) mat[r][c] = parseFloat(e.weight) || 0;
  });
  return { agents, tasks, mat };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FloatingMatrix({ nodes, edges, algoMode, onClose, onApply }: Props) {
  const isHungarian = algoMode === "hungarian-min" || algoMode === "hungarian-max";
  const defaultTab: Tab = isHungarian ? "costs" : "adjacency";

  const [tab,       setTab]       = useState<Tab>(defaultTab);
  const [editMode,  setEditMode]  = useState(false);

  // Position: center-ish of typical viewport
  const { pos, onMouseDown: onDragStart } = useWindowDrag(
    Math.max(40, window.innerWidth  / 2 - 240),
    Math.max(40, window.innerHeight / 2 - 180),
  );
  const { size, onMouseDown: onResizeStart } = useWindowResize(480, 360);

  // ── Adjacency matrix ───────────────────────────────────────────────────────
  const renderAdjacency = () => {
    if (!nodes.length) return <Empty msg="No hay nodos en el lienzo." />;
    const { sorted, mat } = buildAdjMatrix(nodes, edges);
    const outDeg = mat.map((row) => row.reduce((a, b) => a + (b ? 1 : 0), 0));
    const inDeg  = sorted.map((_, j) => mat.reduce((s, row) => s + (row[j] ? 1 : 0), 0));

    return (
      <div style={{ overflowAuto: "auto" } as any}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: "'Courier New', monospace", color: P.text }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                <th style={{ padding: "6px 9px", color: P.muted, fontSize: 9 }}>↓\→</th>
                {sorted.map((n) => (
                  <th key={n.id} style={{ padding: "6px 9px", color: P.purpleBright, textAlign: "center" }}>{n.label}</th>
                ))}
                <th style={{ padding: "6px 9px", color: P.muted, borderLeft: `1px solid ${P.border}`, fontSize: 9 }}>Out</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((nd, i) => (
                <tr key={nd.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "6px 9px", color: P.purpleBright, fontWeight: "bold" }}>{nd.label}</td>
                  {mat[i].map((v, j) => (
                    <td key={j} style={{ padding: "6px 9px", textAlign: "center", background: v ? P.purpleDim : "transparent", color: v ? P.white : P.muted }}>{v || "·"}</td>
                  ))}
                  <td style={{ padding: "6px 9px", textAlign: "center", borderLeft: `1px solid ${P.border}`, color: outDeg[i] > 0 ? P.purple : P.muted }}>{outDeg[i]}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `1px solid ${P.border}` }}>
                <td style={{ padding: "6px 9px", color: P.muted, fontSize: 9 }}>In</td>
                {inDeg.map((v, j) => (
                  <td key={j} style={{ padding: "6px 9px", textAlign: "center", color: v > 0 ? P.purple : P.muted }}>{v}</td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Cost matrix (bipartite) ────────────────────────────────────────────────
  const costData = buildCostMatrix(nodes, edges);

  // Editable local matrix state
  const [localMat, setLocalMat] = useState<number[][] | null>(null);

  useEffect(() => {
    if (costData) setLocalMat(costData.mat.map((r) => [...r]));
  }, [nodes.length, edges.length]);

  const setCell = (r: number, c: number, val: string) => {
    if (!localMat) return;
    const num = parseFloat(val);
    setLocalMat((prev) => {
      if (!prev) return prev;
      const m = prev.map((row) => [...row]);
      m[r][c] = isNaN(num) ? 0 : num;
      return m;
    });
  };

  const renderCosts = () => {
    if (!costData) return <Empty msg="No se detectó estructura bipartita.\nDibuja aristas de Agentes → Tareas." />;
    const { agents, tasks } = costData;
    const mat = (editMode && localMat) ? localMat : costData.mat;
    const accent = algoMode === "hungarian-min" ? P.cyan : P.green;
    const accentDim = algoMode === "hungarian-min" ? P.cyanDim : P.greenDim;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: P.muted }}>MATRIZ DE COSTOS / GANANCIAS</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setEditMode((v) => !v)}
              style={{ padding: "3px 9px", fontSize: 10, background: editMode ? accent + "22" : "transparent", color: editMode ? accent : P.muted, border: `1px solid ${editMode ? accent : P.border}`, borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}
            >
              {editMode ? "✓ Editando" : "✎ Editar"}
            </button>
            {editMode && onApply && (
              <button
                onClick={() => { if (localMat) onApply(agents.map((a) => a.label), tasks.map((t) => t.label), localMat); setEditMode(false); }}
                style={{ padding: "3px 9px", fontSize: 10, background: accent, color: "#000", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}
              >
                ▶ Aplicar
              </button>
            )}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 3, fontSize: 11, fontFamily: "'Courier New', monospace" }}>
            <thead>
              <tr>
                <th style={{ padding: "4px 8px", color: P.muted, fontSize: 9 }}>↓\→</th>
                {tasks.map((t) => (
                  <th key={t.id} style={{ padding: "4px 8px", color: P.purpleBright, textAlign: "center" }}>{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, r) => (
                <tr key={agent.id}>
                  <td style={{ padding: "4px 8px", color: P.purpleBright, fontWeight: "bold" }}>{agent.label}</td>
                  {tasks.map((_, c) => {
                    const v = mat[r]?.[c] ?? 0;
                    return (
                      <td key={c} style={{ padding: "2px" }}>
                        {editMode ? (
                          <input
                            type="number"
                            value={v}
                            onChange={(e) => setCell(r, c, e.target.value)}
                            style={{ width: 46, height: 32, background: "#0e0e0e", color: P.white, border: `1px solid ${accent}55`, borderRadius: 3, textAlign: "center", fontSize: 12, fontFamily: "'Courier New', monospace", outline: "none" }}
                          />
                        ) : (
                          <div style={{ width: 46, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: v ? accentDim : "transparent", color: v ? accent : P.muted, border: `1px solid ${v ? accent + "44" : P.border}`, borderRadius: 3 }}>
                            {v || "·"}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position:     "fixed",
      left:         pos.x,
      top:          pos.y,
      width:        size.w,
      height:       size.h,
      background:   "#0e0e0e",
      border:       `1px solid ${P.borderBright}`,
      borderRadius: 10,
      boxShadow:    "0 16px 48px rgba(0,0,0,0.9)",
      zIndex:       300,
      display:      "flex",
      flexDirection:"column",
      overflow:     "hidden",
      minWidth:     340,
      minHeight:    260,
    }}>
      {/* ── Title bar (drag handle) ──────────────────────────────────────── */}
      <div
        onMouseDown={onDragStart}
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          padding:      "10px 14px",
          borderBottom: `1px solid ${P.border}`,
          cursor:       "grab",
          userSelect:   "none",
          background:   "#111",
          flexShrink:   0,
        }}
      >
        <span style={{ fontSize: 12, color: P.muted }}>⊞</span>
        <span style={{ fontSize: 11, color: P.text, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
          MATRIZ
        </span>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginLeft: 10 }}>
          {(["adjacency", "costs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={(e) => { e.stopPropagation(); setTab(t); }}
              style={{
                padding:      "3px 10px",
                fontSize:     10,
                background:   tab === t ? P.purpleDim : "transparent",
                color:        tab === t ? P.purple    : P.muted,
                border:       `1px solid ${tab === t ? P.purple : "transparent"}`,
                borderRadius: 4,
                cursor:       "pointer",
                fontFamily:   "inherit",
                letterSpacing:1,
              }}
            >
              {t === "adjacency" ? "ADYACENCIA" : "COSTOS"}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "none", border: "none", color: P.muted, cursor: "pointer", fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {tab === "adjacency" ? renderAdjacency() : renderCosts()}
      </div>

      {/* ── Resize handle ───────────────────────────────────────────────── */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position:   "absolute",
          bottom:     0,
          right:      0,
          width:      18,
          height:     18,
          cursor:     "se-resize",
          display:    "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          padding:    "4px",
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill={P.muted}>
          <path d="M9 0 L9 9 L0 9 Z" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ color: P.muted, textAlign: "center", marginTop: "2rem", fontSize: 12, fontFamily: "'Courier New', monospace", whiteSpace: "pre-line", lineHeight: 1.8 }}>
      {msg}
    </div>
  );
}