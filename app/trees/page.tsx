"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { useBSTState } from "../../hooks/useTreeState";
import { useRouter } from "next/navigation";
import type {
  BSTNode,
  TraversalType,
  RebuildMode,
  TraversalResult,
  BSTBuildResult,
  RebuildResult,
} from "../../algorithms/tree";

// ─── Paleta (idéntica al proyecto) ────────────────────────────────────────────
const P = {
  bg:        "#0a0a0a",
  surface:   "#111111",
  border:    "#2a2a2a",
  purple:    "#A855F7",
  purpleDim: "rgba(168,85,247,0.15)",
  cyan:      "#00e5ff",
  cyanDim:   "rgba(0,229,255,0.12)",
  red:       "#ff0055",
  redDim:    "rgba(255,0,85,0.12)",
  green:     "#00ff88",
  greenDim:  "rgba(0,255,136,0.12)",
  yellow:    "#ffd600",
  yellowDim: "rgba(255,214,0,0.12)",
  orange:    "#ff9800",
  orangeDim: "rgba(255,152,0,0.12)",
  text:      "#E0E0E0",
  muted:     "#555",
  white:     "#ffffff",
};

// ─── Button helpers ───────────────────────────────────────────────────────────
const btnGhost = (color: string, colorDim: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 15px",
  background: colorDim, border: `1px solid ${color}`,
  borderRadius: 7, color,
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

const btnFilled = (color: string): CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "8px 18px",
  background: color, border: `1px solid ${color}`,
  borderRadius: 7, color: "#0a0a0a",
  cursor: "pointer", fontFamily: "'Courier New', monospace",
  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
  transition: "all 0.14s", whiteSpace: "nowrap",
});

function Btn({
  color, colorDim, filled = false, onClick, children, disabled = false,
}: {
  color: string; colorDim: string; filled?: boolean;
  onClick?: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  const style = filled ? btnFilled(color) : btnGhost(color, colorDim);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...style, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, background: P.border, alignSelf: "stretch", margin: "0 2px" }} />;
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: "0.8rem", marginTop: "0.5rem",
      color: "#D8B4FE", fontSize: 14, fontWeight: 400, letterSpacing: 1,
      fontFamily: "'Courier New', monospace",
    }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );
}

// ─── BST Tree SVG renderer ────────────────────────────────────────────────────
const NODE_R = 22;
const H_GAP  = 52;  // horizontal spacing between sibling subtrees
const V_GAP  = 72;  // vertical spacing between levels

interface LayoutNode {
  node: BSTNode;
  x: number;
  y: number;
  depth: number;
}

function computeLayout(
  node: BSTNode | null,
  depth: number,
  counter: { v: number },
  result: LayoutNode[]
) {
  if (!node) return;
  computeLayout(node.left,  depth + 1, counter, result);
  const x = counter.v * H_GAP;
  const y = depth * V_GAP;
  result.push({ node, x, y, depth });
  counter.v++;
  computeLayout(node.right, depth + 1, counter, result);
}

function BSTTreeSVG({
  root,
  highlightedValues = [],
  visitedValues     = [],
  currentValue,
}: {
  root: BSTNode;
  highlightedValues?: number[];
  visitedValues?: number[];
  currentValue?: number;
}) {
  const layout: LayoutNode[] = [];
  computeLayout(root, 0, { v: 0 }, layout);

  const minX = Math.min(...layout.map(n => n.x));
  const maxX = Math.max(...layout.map(n => n.x));
  const maxY = Math.max(...layout.map(n => n.y));

  const offX = -minX + 40;
  const offY = 40;
  const svgW = Math.max(maxX - minX + NODE_R * 2 + 80, 300);
  const svgH = maxY + NODE_R * 2 + 60;

  // Build lookup by val for quick access
  const byVal = new Map<number, LayoutNode>();
  layout.forEach(l => byVal.set(l.node.val, l));

  const edges: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];

  layout.forEach(({ node, x, y }) => {
    const cx = x + offX;
    const cy = y + offY;

    if (node.left) {
      const cl = byVal.get(node.left.val)!;
      edges.push(
        <line
          key={`e-${node.val}-l`}
          x1={cx} y1={cy}
          x2={cl.x + offX} y2={cl.y + offY}
          stroke={P.border} strokeWidth={1.5}
        />
      );
    }
    if (node.right) {
      const cr = byVal.get(node.right.val)!;
      edges.push(
        <line
          key={`e-${node.val}-r`}
          x1={cx} y1={cy}
          x2={cr.x + offX} y2={cr.y + offY}
          stroke={P.border} strokeWidth={1.5}
        />
      );
    }

    const isCurrent = node.val === currentValue;
    const isVisited = visitedValues.includes(node.val);
    const isHighlighted = highlightedValues.includes(node.val);

    let stroke = P.border;
    let fill   = "#111";
    let textColor = P.text;

    if (isCurrent) {
      stroke = P.cyan;
      fill   = "rgba(0,229,255,0.18)";
    } else if (isVisited) {
      stroke = P.green;
      fill   = "rgba(0,255,136,0.12)";
      textColor = P.green;
    } else if (isHighlighted) {
      stroke = P.purple;
      fill   = P.purpleDim;
    }

    nodes.push(
      <g key={`n-${node.val}`}>
        <circle
          cx={cx} cy={cy} r={NODE_R}
          fill={fill}
          stroke={stroke}
          strokeWidth={isCurrent ? 2.5 : 1.5}
          style={{
            filter: isCurrent ? `drop-shadow(0 0 6px ${P.cyan}88)` : "none",
            transition: "all 0.25s ease",
          }}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fill={isCurrent ? P.cyan : textColor}
          fontFamily="'Courier New', monospace"
          fontSize={node.val.toString().length > 3 ? 9 : 12}
          fontWeight="bold"
          style={{ transition: "fill 0.25s" }}
        >
          {node.val}
        </text>
      </g>
    );
  });

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      {edges}
      {nodes}
    </svg>
  );
}

// ─── Traversal sequence pills ──────────────────────────────────────────────────
function TraversalSequence({
  sequence,
  visitedValues,
  currentValue,
}: {
  sequence: number[];
  visitedValues: number[];
  currentValue: number | undefined;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {sequence.map((v, i) => {
        const isCurrent = v === currentValue;
        const isVisited = visitedValues.includes(v);
        let bg    = "#0a0a0a";
        let color = P.muted;
        let border = P.border;

        if (isCurrent) { bg = P.cyanDim;   color = P.cyan;   border = P.cyan;   }
        else if (isVisited) { bg = P.greenDim; color = P.green;  border = P.green;  }

        return (
          <span
            key={i}
            style={{
              padding: "4px 10px",
              background: bg, border: `1px solid ${border}`,
              borderRadius: 4, color,
              fontFamily: "'Courier New', monospace", fontSize: 12,
              fontWeight: "bold",
              transition: "all 0.25s",
            }}
          >
            {v}
          </span>
        );
      })}
    </div>
  );
}

// ─── Traversal mode selector ──────────────────────────────────────────────────
const TRAVERSAL_OPTIONS: { value: TraversalType; label: string; desc: string }[] = [
  { value: "inorder",   label: "In-order",   desc: "Izquierda → Raíz → Derecha  ·  Produce salida ordenada" },
  { value: "preorder",  label: "Pre-order",  desc: "Raíz → Izquierda → Derecha  ·  Útil para copiar el árbol" },
  { value: "postorder", label: "Post-order", desc: "Izquierda → Derecha → Raíz  ·  Útil para eliminación" },
];

// ─── Rebuild mode selector ────────────────────────────────────────────────────
const REBUILD_OPTIONS: { value: RebuildMode; label: string }[] = [
  { value: "inorder+preorder",  label: "In-order + Pre-order"  },
  { value: "inorder+postorder", label: "In-order + Post-order" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BSTPage() {
  const state  = useBSTState();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const playRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const traversal = state.currentTraversal;
  const tree      = state.currentTree ?? state.currentRebuild;

  const currentStepData = traversal?.steps[state.traversalStep];
  const progress = traversal
    ? ((state.traversalStep + 1) / traversal.steps.length) * 100
    : 0;

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.isPlaying && traversal) {
      playRef.current = setInterval(() => {
        state.nextStep();
      }, state.playSpeed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [state.isPlaying, state.playSpeed, traversal]);

  // Pause at last step
  useEffect(() => {
    if (traversal && state.traversalStep >= traversal.steps.length - 1 && state.isPlaying) {
      state.pause();
    }
  }, [state.traversalStep, traversal, state.isPlaying]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      state.addValue(state.inputText);
    }
  };

  // Highlighted nodes = currently visiting path
  const highlightedValues = currentStepData?.path ?? [];
  const visitedValues     = currentStepData?.visited ?? [];
  const currentValue      = currentStepData?.visiting !== -1 ? currentStepData?.visiting : undefined;

  return (
    <div style={{
      minHeight: "100vh", background: P.bg,
      fontFamily: "'Courier New', monospace", color: P.text,
    }}>

      {/* ── Toast ── */}
      {state.toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: P.redDim, border: `1px solid ${P.red}`,
          borderRadius: 6, padding: "10px 24px", color: P.red,
          fontSize: 12, zIndex: 999, backdropFilter: "blur(10px)",
          maxWidth: "90vw", textAlign: "center",
        }}>
          {state.toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "2.2rem 1rem 1.4rem" }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>🌳</div>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 400, color: P.text,
          letterSpacing: 2, margin: "0 0 6px",
        }}>
          Visualizador de Árbol Binario de Búsqueda
        </h1>
        <p style={{ color: P.muted, fontSize: 11, margin: 0 }}>
          Construye un BST, explora recorridos y reconstruye árboles desde secuencias
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1rem 3rem" }}>

        {/* ════ TOOLBAR ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: "1.4rem",
          display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        }}>
          <Btn color={P.green} colorDim={P.greenDim}
            onClick={() => router.push("/editor?showSelector=true")}>
            ⟵ Cambiar algoritmo
          </Btn>
          <Divider />
          <Btn color={P.red} colorDim={P.redDim} onClick={state.clear}>
            ✕ Limpiar todo
          </Btn>
        </div>

        {/* ════ TAB SWITCHER ════ */}
        <div style={{
          display: "flex", gap: 0,
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 10, overflow: "hidden", marginBottom: "1.4rem",
        }}>
          {(["build", "traversal", "rebuild"] as const).map((tab, i) => {
            const labels = ["🔨 Build Tree", "🔁 Traversals", "♻ Rebuild Tree"];
            const active = state.activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => state.setActiveTab(tab)}
                style={{
                  flex: 1, padding: "12px 8px",
                  background: active ? P.purpleDim : "transparent",
                  borderBottom: active ? `2px solid ${P.purple}` : "2px solid transparent",
                  border: "none",
                  color: active ? P.purple : P.muted,
                  cursor: "pointer", fontFamily: "'Courier New', monospace",
                  fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
                  transition: "all 0.14s",
                }}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>

        {/* ════ BUILD TREE PANEL ════ */}
        {state.activeTab === "build" && (
          <>
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
            }}>
              <SectionHeader icon="✏" title="Ingresar Números" />
              <p style={{ fontSize: 10, color: P.muted, marginBottom: "0.8rem" }}>
                El primer número ingresado será la raíz. Los menores van a la izquierda, los mayores a la derecha.
              </p>

              {/* Input row */}
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  ref={inputRef}
                  type="number"
                  value={state.inputText}
                  onChange={e => state.setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un número y presiona Enter"
                  style={{
                    flex: 1, minWidth: 200, padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 13, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.purple)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
                <Btn color={P.purple} colorDim={P.purpleDim}
                  onClick={() => state.addValue(state.inputText)}>
                  + Agregar
                </Btn>
              </div>

              {/* Number chips */}
              {state.values.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {state.values.map((v, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px",
                      background: i === 0 ? "rgba(168,85,247,0.25)" : P.purpleDim,
                      border: `1px solid ${i === 0 ? P.purple : P.purple + "44"}`,
                      borderRadius: 20, color: P.purple,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                    }}>
                      {i === 0 && <span style={{ fontSize: 9, color: P.yellow }}>ROOT</span>}
                      <span>{v}</span>
                      <button onClick={() => state.removeValue(i)} style={{
                        background: "none", border: "none", color: P.red,
                        cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0,
                      }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: P.muted, fontSize: 11, padding: "8px 0" }}>
                  Sin elementos — agrega números para construir el árbol
                </div>
              )}

              <div style={{ marginTop: 10, fontSize: 10, color: P.muted }}>
                {state.totalValues} / 30 nodos
              </div>
            </div>

            {/* Random generator */}
            <RandomPanel onGenerate={(nums) => {
              state.loadValues(nums);
            }} />

            {/* Build button */}
            <button
              onClick={() => { state.build(); }}
              style={{
                ...btnFilled(P.cyan),
                width: "100%", justifyContent: "center",
                padding: "14px", marginBottom: "1.5rem", fontSize: 13,
              }}
            >
              🔨 BUILD TREE
            </button>
          </>
        )}

        {/* ════ TRAVERSAL PANEL ════ */}
        {state.activeTab === "traversal" && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
          }}>
            <SectionHeader icon="🔁" title="Modo de Recorrido" />

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              {TRAVERSAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    state.setTraversalType(opt.value as TraversalType);
                  }}
                  style={{
                    ...btnGhost(
                      state.traversalType === opt.value ? P.cyan : P.muted,
                      state.traversalType === opt.value ? P.cyanDim : "transparent"
                    ),
                    borderColor: state.traversalType === opt.value ? P.cyan : P.border,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 10, color: P.muted, marginBottom: "1rem",
              padding: "6px 10px", background: "#0a0a0a",
              borderRadius: 5, border: `1px solid ${P.border}`,
            }}>
              {TRAVERSAL_OPTIONS.find(o => o.value === state.traversalType)?.desc}
            </div>

            <Btn color={P.cyan} colorDim={P.cyanDim} filled
              onClick={state.runTraversal}
              disabled={!state.activeRoot}>
              ▶ Ejecutar Recorrido
            </Btn>

            {!state.activeRoot && (
              <div style={{ marginTop: 8, fontSize: 11, color: P.orange }}>
                ⚠ Construye un árbol primero en la pestaña "Build Tree"
              </div>
            )}

            {/* Traversal result + playback */}
            {traversal && (
              <>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>SECUENCIA:</div>
                  <TraversalSequence
                    sequence={traversal.sequence}
                    visitedValues={visitedValues}
                    currentValue={currentValue}
                  />
                </div>

                {/* Progress bar */}
                <div style={{
                  height: 3, background: P.border, borderRadius: 2,
                  margin: "14px 0 10px", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: `linear-gradient(90deg, ${P.purple}, ${P.cyan})`,
                    borderRadius: 2, transition: "width 0.2s",
                  }} />
                </div>

                {/* Step description */}
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${P.border}`,
                  borderRadius: 6, padding: "10px 14px",
                  fontSize: 12, color: P.text, marginBottom: 14,
                  minHeight: 38, display: "flex", alignItems: "center",
                }}>
                  <span style={{ color: P.cyan, marginRight: 8 }}>
                    [{state.traversalStep + 1}/{traversal.steps.length}]
                  </span>
                  {currentStepData?.description}
                </div>

                {/* Playback controls */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={() => state.goToStep(0)} disabled={state.traversalStep === 0}>
                    ⏮ Inicio
                  </Btn>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={state.prevStep} disabled={state.traversalStep === 0}>
                    ◀ Anterior
                  </Btn>
                  {state.isPlaying ? (
                    <Btn color={P.orange} colorDim={P.orangeDim} onClick={state.pause}>
                      ⏸ Pausar
                    </Btn>
                  ) : (
                    <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={state.play}
                      disabled={state.traversalStep >= traversal.steps.length - 1 && !state.isPlaying}>
                      ▶ Reproducir
                    </Btn>
                  )}
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={state.nextStep} disabled={state.traversalStep >= traversal.steps.length - 1}>
                    Siguiente ▶
                  </Btn>
                  <Btn color={P.purple} colorDim={P.purpleDim}
                    onClick={() => state.goToStep(traversal.steps.length - 1)}
                    disabled={state.traversalStep >= traversal.steps.length - 1}>
                    Final ⏭
                  </Btn>

                  <Divider />

                  {/* Speed */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: P.muted }}>Velocidad:</span>
                    {[
                      { label: "Lento",  ms: 1000 },
                      { label: "Normal", ms: 600  },
                      { label: "Rápido", ms: 250  },
                      { label: "Turbo",  ms: 80   },
                    ].map(sp => (
                      <button key={sp.ms}
                        onClick={() => state.setPlaySpeed(sp.ms)}
                        style={{
                          padding: "4px 9px",
                          background: state.playSpeed === sp.ms ? P.cyanDim : "transparent",
                          border: `1px solid ${state.playSpeed === sp.ms ? P.cyan : P.border}`,
                          borderRadius: 5,
                          color: state.playSpeed === sp.ms ? P.cyan : P.muted,
                          cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 10,
                        }}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber */}
                <div style={{ marginTop: 14 }}>
                  <input
                    type="range" min={0} max={traversal.steps.length - 1}
                    value={state.traversalStep}
                    onChange={e => state.goToStep(Number(e.target.value))}
                    style={{ width: "100%", accentColor: P.purple, cursor: "pointer" }}
                  />
                </div>

                {/* Step list */}
                <SectionHeader icon="≡" title="Lista de Pasos" />
                <div style={{
                  background: "#0a0a0a", border: `1px solid ${P.border}`,
                  borderRadius: 8, padding: "1rem",
                  maxHeight: 260, overflowY: "auto",
                }}>
                  {traversal.steps.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => state.goToStep(idx)}
                      style={{
                        padding: "8px 12px",
                        background: idx === state.traversalStep ? P.purpleDim : "transparent",
                        border: `1px solid ${idx === state.traversalStep ? P.purple : "transparent"}`,
                        borderRadius: 5, marginBottom: 3,
                        cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start",
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={e => {
                        if (idx !== state.traversalStep)
                          (e.currentTarget as HTMLDivElement).style.background = "#1a1a1a";
                      }}
                      onMouseLeave={e => {
                        if (idx !== state.traversalStep)
                          (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }}
                    >
                      <span style={{
                        color: idx === state.traversalStep ? P.purple : P.muted,
                        fontSize: 10, minWidth: 30, paddingTop: 1,
                      }}>#{step.iteration}</span>
                      <span style={{ fontSize: 11, color: P.text, flex: 1 }}>
                        {step.description}
                      </span>
                      {step.visiting !== -1 && (
                        <span style={{
                          fontSize: 10, color: P.cyan,
                          fontFamily: "'Courier New', monospace",
                        }}>
                          val={step.visiting}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ REBUILD TREE PANEL ════ */}
        {state.activeTab === "rebuild" && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.2rem",
          }}>
            <SectionHeader icon="♻" title="Reconstruir Árbol desde Secuencias" />
            <p style={{ fontSize: 10, color: P.muted, marginBottom: "1rem" }}>
              Ingresa dos secuencias de recorrido para reconstruir el árbol. Todos los nodos deben estar presentes en ambas secuencias.
            </p>

            {/* Rebuild mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
              {REBUILD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => state.setRebuildMode(opt.value as RebuildMode)}
                  style={{
                    ...btnGhost(
                      state.rebuildMode === opt.value ? P.yellow : P.muted,
                      state.rebuildMode === opt.value ? P.yellowDim : "transparent"
                    ),
                    borderColor: state.rebuildMode === opt.value ? P.yellow : P.border,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sequence inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  SECUENCIA IN-ORDER (separada por espacios o comas)
                </label>
                <input
                  type="text"
                  value={state.rebuildInorder}
                  onChange={e => state.setRebuildInorder(e.target.value)}
                  placeholder="ej: 3 9 10 27 38 43 82"
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.yellow)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  SECUENCIA {state.rebuildMode === "inorder+preorder" ? "PRE-ORDER" : "POST-ORDER"}
                </label>
                <input
                  type="text"
                  value={state.rebuildSecond}
                  onChange={e => state.setRebuildSecond(e.target.value)}
                  placeholder={
                    state.rebuildMode === "inorder+preorder"
                      ? "ej: 38 27 3 9 10 43 82"
                      : "ej: 3 10 9 27 82 43 38"
                  }
                  style={{
                    width: "100%", padding: "9px 14px",
                    background: "#0a0a0a", border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.yellow)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
              <Btn color={P.purple} colorDim={P.purpleDim}
                onClick={state.prefillRebuildFromCurrent}
                disabled={!state.activeRoot}>
                📋 Usar árbol actual
              </Btn>
              <Btn color={P.yellow} colorDim={P.yellowDim} filled onClick={state.doRebuild}>
                ♻ Reconstruir
              </Btn>
              <Btn color={P.red} colorDim={P.redDim} onClick={state.clearRebuild}>
                ✕ Limpiar
              </Btn>
            </div>

            {/* Rebuild result info */}
            {state.currentRebuild && (
              <div style={{
                padding: "10px 14px",
                background: P.greenDim, border: `1px solid ${P.green}44`,
                borderRadius: 6, fontSize: 11, color: P.green,
              }}>
                ✓ Árbol reconstruido correctamente — {state.currentRebuild.nodeCount} nodos, altura {state.currentRebuild.height}
              </div>
            )}
          </div>
        )}

        {/* ════ TREE STATS ════ */}
        {tree && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "1.2rem",
          }}>
            {[
              { label: "Nodos",   value: tree.nodeCount, color: P.cyan   },
              { label: "Altura",  value: tree.height,    color: P.purple },
              { label: "Raíz",    value: tree.root?.val ?? "-", color: P.green  },
              { label: "In-order",  value: tree.inorder.join(", "),  color: P.yellow },
            ].map(s => (
              <div key={s.label} style={{
                background: P.surface, border: `1px solid ${P.border}`,
                borderRadius: 8, padding: "10px 16px", flex: "1 1 100px", minWidth: 100,
              }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: typeof s.value === "string" && s.value.length > 10 ? 10 : 16, color: s.color, fontWeight: "bold" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ TREE VISUALIZATION ════ */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`,
          borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
        }}>
          <SectionHeader icon="🌳" title="Visualización del Árbol" />

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 12 }}>
            {[
              { color: P.cyan,   label: "Visitando ahora" },
              { color: P.green,  label: "Ya visitado"     },
              { color: P.purple, label: "En ruta"         },
              { color: "#444",   label: "Sin visitar"     },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: color, borderRadius: "50%" }} />
                <span style={{ fontSize: 10, color: P.muted, fontFamily: "'Courier New', monospace" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* SVG tree */}
          <div style={{
            background: "#0a0a0a", border: `1px solid ${P.border}`,
            borderRadius: 6, overflowX: "auto", minHeight: 180,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0.5rem",
          }}>
            {state.activeRoot ? (
              <BSTTreeSVG
                root={state.activeRoot}
                highlightedValues={highlightedValues}
                visitedValues={visitedValues}
                currentValue={currentValue}
              />
            ) : (
              <div style={{ color: P.muted, fontSize: 12, padding: "2rem", textAlign: "center" }}>
                Agrega números y presiona "BUILD TREE" para visualizar el árbol
              </div>
            )}
          </div>
        </div>

        {/* ════ TRAVERSAL SEQUENCES (always visible when tree exists) ════ */}
        {tree && (
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`,
            borderRadius: 8, padding: "1.2rem", marginBottom: "1.5rem",
          }}>
            <SectionHeader icon="📋" title="Secuencias de Recorrido" />
            {[
              { label: "In-order",   values: tree.inorder,   color: P.cyan   },
              { label: "Pre-order",  values: tree.preorder,  color: P.purple },
              { label: "Post-order", values: tree.postorder, color: P.yellow },
            ].map(({ label, values, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 6 }}>{label.toUpperCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {values.map((v, i) => (
                    <span key={i} style={{
                      padding: "4px 10px",
                      background: "#0a0a0a", border: `1px solid ${color}33`,
                      borderRadius: 4, color,
                      fontFamily: "'Courier New', monospace", fontSize: 12,
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Random panel ─────────────────────────────────────────────────────────────
function RandomPanel({ onGenerate }: { onGenerate: (nums: number[]) => void }) {
  const [open, setOpen]   = useState(false);
  const [count, setCount] = useState(7);
  const [min, setMin]     = useState(1);
  const [max, setMax]     = useState(99);

  const generate = () => {
    if (min >= max) return;
    const set = new Set<number>();
    let tries = 0;
    while (set.size < count && tries < 500) {
      set.add(Math.floor(Math.random() * (max - min + 1)) + min);
      tries++;
    }
    onGenerate([...set]);
    setOpen(false);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Btn color={P.purple} colorDim={P.purpleDim} onClick={() => setOpen(v => !v)}>
        🎲 {open ? "Cerrar Aleatorio" : "Aleatorio"}
      </Btn>
      {open && (
        <div style={{
          marginTop: 8, padding: "1rem",
          background: "#0a0a0a", border: `1px solid ${P.border}`,
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            {[
              { label: "Número de nodos", val: count, set: setCount, min: 1, max: 20 },
              { label: "Valor mínimo",    val: min,   set: setMin,   min: -999, max: 999 },
              { label: "Valor máximo",    val: max,   set: setMax,   min: -999, max: 999 },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 10, color: P.muted, display: "block", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type="number"
                  value={f.val}
                  min={f.min} max={f.max}
                  onChange={e => f.set(Number(e.target.value))}
                  style={{
                    width: 90, padding: "7px 10px",
                    background: P.surface, border: `1px solid ${P.border}`,
                    borderRadius: 6, color: P.text,
                    fontFamily: "'Courier New', monospace", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = P.purple)}
                  onBlur={e => (e.target.style.borderColor = P.border)}
                />
              </div>
            ))}
            <Btn color={P.cyan} colorDim={P.cyanDim} filled onClick={generate}>
              Generar
            </Btn>
          </div>
          {min >= max && (
            <div style={{ marginTop: 8, fontSize: 10, color: P.red }}>
              ⚠ El valor mínimo debe ser menor que el máximo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
